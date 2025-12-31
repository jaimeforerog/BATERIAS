using Baterias.Application.Handlers;
using Baterias.Application.Projections;
using JasperFx.Events.Projections;
using Marten;

var builder = WebApplication.CreateBuilder(args);

// Add Application Insights telemetry
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnableQuickPulseMetricStream = true;
});

// Get database connection string (from appsettings or environment variable)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                       ?? builder.Configuration.GetConnectionString("BatteryDatabase")!;

// Add SignalR for real-time updates
builder.Services.AddSignalR();

// Register BatteryEventBroadcaster as singleton
builder.Services.AddSingleton<Baterias.Infrastructure.SignalR.BatteryEventBroadcaster>();

// Add Marten for Event Sourcing
builder.Services.AddMarten(sp =>
{
    var opts = new StoreOptions();
    opts.Connection(connectionString);

    // Register projections (inline for synchronous updates)
    opts.Projections.Add<BatteryStatusProjectionHandler>(ProjectionLifecycle.Inline);
    opts.Projections.Add(new MaintenanceHistoryProjectionHandler(), ProjectionLifecycle.Inline);
    opts.Projections.Add(new Baterias.Application.Projections.AuditLogProjectionHandler(), ProjectionLifecycle.Inline);

    // Enable Optimistic Concurrency
    opts.Schema.For<Baterias.Domain.Aggregates.Battery>().UseOptimisticConcurrency(true);

    // Register Battery Brand documents
    opts.Schema.For<Baterias.Application.Documents.BatteryBrandDocument>().Identity(x => x.Id);

    // Register Audit Log with indexes for optimal querying
    opts.Schema.For<Baterias.Application.Projections.AuditLogEntry>()
        .Index(x => x.EventTimestamp)
        .Index(x => x.PerformedBy)
        .Index(x => x.SerialNumber)
        .Index(x => x.EventType)
        .Index(x => x.BatteryId);

    // Register event broadcaster for SignalR
    opts.Listeners.Add(sp.GetRequiredService<Baterias.Infrastructure.SignalR.BatteryEventBroadcaster>());

    return opts;
})
.UseLightweightSessions();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString,
        name: "postgresql",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "db", "sql", "postgresql" });

// Register MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(Baterias.Application.Commands.RegisterBatteryCommand).Assembly));

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  // Allow localhost for development
                  if (origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:"))
                      return true;
                  // Allow configured origins
                  return allowedOrigins.Contains(origin);
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add controllers with global filters
builder.Services.AddControllers(options =>
{
    // options.Filters.Add<Baterias.Api.Filters.ConcurrencyExceptionFilter>();
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "API de Control de Baterías",
        Version = "v1",
        Description = "API para control de baterías de vehículos usando Event Sourcing con Marten",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Sistema de Control de Baterías"
        }
    });

    // Incluir comentarios XML
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// Seed battery brands
using (var scope = app.Services.CreateScope())
{
    var session = scope.ServiceProvider.GetRequiredService<Marten.IDocumentSession>();
    var seedService = new Baterias.Application.Services.BrandSeedService(session);
    await seedService.SeedBrandsIfNeededAsync();
}

// Configure Swagger UI (enabled in all environments for API testing)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API de Control de Baterías v1");
    if (app.Environment.IsDevelopment())
    {
        options.RoutePrefix = string.Empty; // Swagger UI en la raíz en desarrollo
    }
    else
    {
        options.RoutePrefix = "swagger"; // /swagger en producción
    }
    options.DocumentTitle = "API de Control de Baterías";
});

// Use HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("AllowFrontend");

// Detailed health check endpoint with JSON response
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = HealthChecks.UI.Client.UIResponseWriter.WriteHealthCheckUIResponse
});

// Simple readiness check for load balancers (returns 200 OK if healthy)
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true,
    AllowCachingResponses = false
});

// Liveness check (API is running)
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // No health checks, just returns 200 if app is running
});

app.MapControllers();

// Map SignalR hub
app.MapHub<Baterias.Infrastructure.SignalR.BatteryHub>("/hubs/battery");

app.Run();
