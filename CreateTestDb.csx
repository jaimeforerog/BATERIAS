#!/usr/bin/env dotnet-script
#r "nuget: Npgsql, 8.0.3"

using Npgsql;

var connectionString = "Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=postgres";

try
{
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();

    // Check if database exists
    await using var checkCmd = new NpgsqlCommand(
        "SELECT 1 FROM pg_database WHERE datname = 'battery_test'",
        conn);

    var exists = await checkCmd.ExecuteScalarAsync();

    if (exists == null)
    {
        // Create database
        await using var createCmd = new NpgsqlCommand(
            "CREATE DATABASE battery_test",
            conn);
        await createCmd.ExecuteNonQueryAsync();
        Console.WriteLine("✅ Base de datos 'battery_test' creada exitosamente");
    }
    else
    {
        Console.WriteLine("ℹ️  La base de datos 'battery_test' ya existe");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Environment.Exit(1);
}
