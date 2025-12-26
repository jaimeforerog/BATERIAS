using Baterias.Application.Handlers;
using Baterias.Application.Projections;
using JasperFx.Events.Projections;
using Marten;

var builder = WebApplication.CreateBuilder(args);

// Get database connection string (from appsettings or environment variable)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                       ?? builder.Configuration.GetConnectionString("BatteryDatabase")!;

// Add Marten for Event Sourcing
builder.Services.AddMarten((StoreOptions opts) =>
{
    opts.Connection(connectionString);

    // Register projections (inline for synchronous updates)
    opts.Projections.Add<BatteryStatusProjectionHandler>(ProjectionLifecycle.Inline);
    opts.Projections.Add(new MaintenanceHistoryProjectionHandler(), ProjectionLifecycle.Inline);

    // Enable Optimistic Concurrency
    opts.Schema.For<Baterias.Domain.Aggregates.Battery>().UseOptimisticConcurrency(true);
})
.UseLightweightSessions();

// Add Health Checks
builder.Services.AddHealthChecks();

// Register MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(Baterias.Application.Commands.RegisterBatteryCommand).Assembly));

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
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

app.UseCors("AllowFrontend");

// Add health check endpoint
app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
