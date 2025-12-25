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

    var tables = new List<string>();
    while (await reader.ReadAsync())
    {
        var tableName = reader.GetString(0);
        tables.Add(tableName);
        Console.WriteLine($"📋 {tableName,-50} Size: {reader.GetString(1),-10} Columns: {reader.GetInt64(2)}");
    }

    await reader.CloseAsync();

    // Count records in key tables
    Console.WriteLine("\n=== Conteo de registros ===\n");

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
            Console.WriteLine($"⚠️  {table,-50} Error: {ex.Message}");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Environment.Exit(1);
}
