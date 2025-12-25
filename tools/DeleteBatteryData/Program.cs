using Npgsql;

var connectionString = "Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=battery_control";

Console.WriteLine("╔════════════════════════════════════════════════════════════════╗");
Console.WriteLine("║  ADVERTENCIA: Borrado de TODOS los datos de baterías          ║");
Console.WriteLine("╚════════════════════════════════════════════════════════════════╝\n");

try
{
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();

    // Mostrar datos actuales
    Console.WriteLine("📊 Datos actuales en la base de datos:\n");

    var queries = new Dictionary<string, string>
    {
        { "Baterías", "SELECT COUNT(*) FROM mt_doc_batterystatusprojection" },
        { "Mantenimientos", "SELECT COUNT(*) FROM mt_doc_maintenancehistoryprojection" },
        { "Eventos", "SELECT COUNT(*) FROM mt_events" },
        { "Streams", "SELECT COUNT(*) FROM mt_streams" }
    };

    foreach (var (name, query) in queries)
    {
        await using var cmd = new NpgsqlCommand(query, conn);
        var count = await cmd.ExecuteScalarAsync();
        Console.WriteLine($"   {name,-20}: {count} registros");
    }

    Console.WriteLine("\n⚠️  ESTA ACCIÓN NO SE PUEDE DESHACER\n");
    Console.Write("¿Estás seguro de que quieres borrar TODOS los datos? (escribe 'SI' para confirmar): ");

    var confirmation = Console.ReadLine();

    if (confirmation?.ToUpper() != "SI")
    {
        Console.WriteLine("\n❌ Operación cancelada por el usuario.");
        return;
    }

    Console.WriteLine("\n🗑️  Borrando datos...\n");

    // Borrar proyecciones
    await ExecuteCommand(conn, "TRUNCATE TABLE mt_doc_batterystatusprojection RESTART IDENTITY CASCADE",
        "✅ Proyección de baterías borrada");
    await ExecuteCommand(conn, "TRUNCATE TABLE mt_doc_maintenancehistoryprojection RESTART IDENTITY CASCADE",
        "✅ Proyección de mantenimientos borrada");

    // Borrar eventos
    await ExecuteCommand(conn, "DELETE FROM mt_events",
        "✅ Eventos borrados");

    // Borrar streams
    await ExecuteCommand(conn, "DELETE FROM mt_streams",
        "✅ Streams borrados");

    // Limpiar tabla de progresión
    await ExecuteCommand(conn, "TRUNCATE TABLE mt_event_progression RESTART IDENTITY CASCADE",
        "✅ Progresión de eventos limpiada");

    // Verificar resultado
    Console.WriteLine("\n📊 Verificación final:\n");

    foreach (var (name, query) in queries)
    {
        await using var cmd = new NpgsqlCommand(query, conn);
        var count = await cmd.ExecuteScalarAsync();
        Console.WriteLine($"   {name,-20}: {count} registros");
    }

    Console.WriteLine("\n✅ ¡Todos los datos han sido borrados exitosamente!");
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ Error: {ex.Message}");
    Environment.Exit(1);
}

static async Task ExecuteCommand(NpgsqlConnection conn, string sql, string successMessage)
{
    try
    {
        await using var cmd = new NpgsqlCommand(sql, conn);
        await cmd.ExecuteNonQueryAsync();
        Console.WriteLine(successMessage);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error ejecutando: {sql}");
        Console.WriteLine($"   {ex.Message}");
        throw;
    }
}
