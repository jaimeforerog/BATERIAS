using Npgsql;

var connectionString = "Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=postgres";
var targetDb = "battery_control";

Console.WriteLine($"⚠️  Estás a punto de ELIMINAR TODOS LOS DATOS de la base de datos '{targetDb}'.");

// Force check logic simlified for this tool - just run it
try
{
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();

    // 1. Terminate existing connections
    Console.WriteLine($"🔌 Cerrando conexiones a '{targetDb}'...");
    var killSql = $@"
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '{targetDb}'
        AND pid <> pg_backend_pid();";

    await using (var killCmd = new NpgsqlCommand(killSql, conn))
    {
        await killCmd.ExecuteNonQueryAsync();
    }

    // 2. Drop Database
    Console.WriteLine($"🗑️  Eliminando base de datos '{targetDb}'...");
    var dropSql = $"DROP DATABASE IF EXISTS {targetDb};";
    await using (var dropCmd = new NpgsqlCommand(dropSql, conn))
    {
        await dropCmd.ExecuteNonQueryAsync();
    }

    // 3. Create Database
    Console.WriteLine($"✨ Creando nueva base de datos '{targetDb}'...");
    var createSql = $"CREATE DATABASE {targetDb};";
    await using (var createCmd = new NpgsqlCommand(createSql, conn))
    {
        await createCmd.ExecuteNonQueryAsync();
    }

    Console.WriteLine("✅ Base de datos reseteada exitosamente. El proyecto creará el esquema automáticamente al iniciar.");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Environment.Exit(1);
}
