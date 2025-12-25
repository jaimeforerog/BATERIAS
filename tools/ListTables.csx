#!/usr/bin/env dotnet-script
#r "nuget: Npgsql, 8.0.3"

using Npgsql;

var connectionString = "Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=battery_control";

try
{
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();

    Console.WriteLine("=== Tablas de Marten en battery_control ===\n");

    // List all mt_* tables
    await using var cmd = new NpgsqlCommand(@"
        SELECT tablename,
               pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
               (SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = schemaname AND table_name = tablename) as columns
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename LIKE 'mt_%'
        ORDER BY tablename", conn);

    await using var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        Console.WriteLine($"📋 {reader.GetString(0),-50} Size: {reader.GetString(1),-10} Columns: {reader.GetInt64(2)}");
    }

    await reader.CloseAsync();

    // Count records in key tables
    Console.WriteLine("\n=== Conteo de registros ===\n");

    var tables = new[] { "mt_events", "mt_streams", "mt_doc_batterystatu", "mt_doc_maintenancehistoryprojection", "mt_doc_equipobatteryprojection" };

    foreach (var table in tables)
    {
        try
        {
            await using var countCmd = new NpgsqlCommand($"SELECT COUNT(*) FROM {table}", conn);
            var count = await countCmd.ExecuteScalarAsync();
            Console.WriteLine($"📊 {table,-50} Registros: {count}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  {table,-50} No existe o error: {ex.Message}");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Environment.Exit(1);
}
