using Npgsql;

var connectionString = "Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=postgres";

try
{
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();
    Console.WriteLine("✅ Conectado a PostgreSQL");

    // Create battery_test database
    await using var checkTestCmd = new NpgsqlCommand(
        "SELECT 1 FROM pg_database WHERE datname = 'battery_test'",
        conn);
    var existsTest = await checkTestCmd.ExecuteScalarAsync();
    if (existsTest == null)
    {
        await using var createTestCmd = new NpgsqlCommand("CREATE DATABASE battery_test", conn);
        await createTestCmd.ExecuteNonQueryAsync();
        Console.WriteLine("✅ Base de datos 'battery_test' creada exitosamente");
    }
    else
    {
        Console.WriteLine("ℹ️  La base de datos 'battery_test' ya existe");
    }

    // Create battery_control database
    await using var checkControlCmd = new NpgsqlCommand(
        "SELECT 1 FROM pg_database WHERE datname = 'battery_control'",
        conn);
    var existsControl = await checkControlCmd.ExecuteScalarAsync();
    if (existsControl == null)
    {
        await using var createControlCmd = new NpgsqlCommand("CREATE DATABASE battery_control", conn);
        await createControlCmd.ExecuteNonQueryAsync();
        Console.WriteLine("✅ Base de datos 'battery_control' creada exitosamente");
    }
    else
    {
        Console.WriteLine("ℹ️  La base de datos 'battery_control' ya existe");
    }

    Console.WriteLine("\n🎯 Configuración completa. Las bases de datos están listas.");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Console.WriteLine($"\nAsegúrate de que PostgreSQL esté corriendo en localhost:5432");
    Console.WriteLine($"Usuario: postgres");
    Console.WriteLine($"Password: postgres");
    Environment.Exit(1);
}
