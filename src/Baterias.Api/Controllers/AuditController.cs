using Baterias.Application.Projections;
using ClosedXML.Excel;
using Marten;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace Baterias.Api.Controllers;

[ApiController]
[Route("api/audit")]
public class AuditController : ControllerBase
{
    private readonly IQuerySession _querySession;
    private readonly ILogger<AuditController> _logger;

    public AuditController(IQuerySession querySession, ILogger<AuditController> logger)
    {
        _querySession = querySession;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene eventos de auditoría con filtros opcionales
    /// </summary>
    [HttpGet("events")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<AuditEventResponse>> GetAuditEvents(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? performedBy,
        [FromQuery] string? serialNumber,
        [FromQuery] string? eventType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        try
        {
            // Build query with filters
            var query = _querySession.Query<AuditLogEntry>();

            if (startDate.HasValue)
                query = query.Where(e => e.EventTimestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EventTimestamp <= endDate.Value.AddDays(1).AddSeconds(-1));

            if (!string.IsNullOrWhiteSpace(performedBy))
                query = query.Where(e => e.PerformedBy.Contains(performedBy));

            if (!string.IsNullOrWhiteSpace(serialNumber))
                query = query.Where(e => e.SerialNumber.Contains(serialNumber));

            if (!string.IsNullOrWhiteSpace(eventType))
                query = query.Where(e => e.EventType == eventType);

            // Get total count before pagination
            var totalCount = await query.CountAsync(ct);

            // Apply pagination and ordering
            var events = await query
                .OrderByDescending(e => e.EventTimestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            _logger.LogInformation("Retrieved {Count} audit events (page {Page}, total {Total})",
                events.Count, page, totalCount);

            return Ok(new AuditEventResponse
            {
                Events = events,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit events");
            return StatusCode(500, new { error = "Error al obtener eventos de auditoría" });
        }
    }

    /// <summary>
    /// Exporta eventos de auditoría a Excel
    /// </summary>
    [HttpGet("events/export/excel")]
    public async Task<IActionResult> ExportAuditEventsToExcel(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? performedBy,
        [FromQuery] string? serialNumber,
        [FromQuery] string? eventType,
        CancellationToken ct = default)
    {
        try
        {
            // Build query with same filters (no pagination for export)
            var query = _querySession.Query<AuditLogEntry>();

            if (startDate.HasValue)
                query = query.Where(e => e.EventTimestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EventTimestamp <= endDate.Value.AddDays(1).AddSeconds(-1));

            if (!string.IsNullOrWhiteSpace(performedBy))
                query = query.Where(e => e.PerformedBy.Contains(performedBy));

            if (!string.IsNullOrWhiteSpace(serialNumber))
                query = query.Where(e => e.SerialNumber.Contains(serialNumber));

            if (!string.IsNullOrWhiteSpace(eventType))
                query = query.Where(e => e.EventType == eventType);

            var events = await query
                .OrderByDescending(e => e.EventTimestamp)
                .Take(10000) // Limit to 10,000 records for performance
                .ToListAsync(ct);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Registro de Auditoría");

            // Headers
            worksheet.Cell(1, 1).Value = "Fecha/Hora";
            worksheet.Cell(1, 2).Value = "Tipo de Evento";
            worksheet.Cell(1, 3).Value = "Número de Serie";
            worksheet.Cell(1, 4).Value = "Realizado Por";
            worksheet.Cell(1, 5).Value = "Equipo";
            worksheet.Cell(1, 6).Value = "Voltaje";
            worksheet.Cell(1, 7).Value = "Descripción";
            worksheet.Cell(1, 8).Value = "Notas";

            // Style headers
            var headerRange = worksheet.Range(1, 1, 1, 8);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // Data
            int row = 2;
            foreach (var evt in events)
            {
                worksheet.Cell(row, 1).Value = evt.EventTimestamp.ToString("yyyy-MM-dd HH:mm:ss");
                worksheet.Cell(row, 2).Value = TranslateEventType(evt.EventType);
                worksheet.Cell(row, 3).Value = evt.SerialNumber;
                worksheet.Cell(row, 4).Value = evt.PerformedBy;
                worksheet.Cell(row, 5).Value = evt.EquipoCodigo ?? "-";
                worksheet.Cell(row, 6).Value = evt.VoltageReading.HasValue ? $"{evt.VoltageReading:F2}V" : "-";
                worksheet.Cell(row, 7).Value = evt.EventDescription;
                worksheet.Cell(row, 8).Value = evt.Notes ?? "-";
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(
                content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Auditoria_Baterias_{DateTime.Now:yyyyMMdd_HHmm}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exportando auditoría a Excel");
            return StatusCode(500, "Error generando el reporte");
        }
    }

    /// <summary>
    /// Exporta eventos de auditoría a CSV
    /// </summary>
    [HttpGet("events/export/csv")]
    public async Task<IActionResult> ExportAuditEventsToCSV(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? performedBy,
        [FromQuery] string? serialNumber,
        [FromQuery] string? eventType,
        CancellationToken ct = default)
    {
        try
        {
            // Build query with same filters
            var query = _querySession.Query<AuditLogEntry>();

            if (startDate.HasValue)
                query = query.Where(e => e.EventTimestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EventTimestamp <= endDate.Value.AddDays(1).AddSeconds(-1));

            if (!string.IsNullOrWhiteSpace(performedBy))
                query = query.Where(e => e.PerformedBy.Contains(performedBy));

            if (!string.IsNullOrWhiteSpace(serialNumber))
                query = query.Where(e => e.SerialNumber.Contains(serialNumber));

            if (!string.IsNullOrWhiteSpace(eventType))
                query = query.Where(e => e.EventType == eventType);

            var events = await query
                .OrderByDescending(e => e.EventTimestamp)
                .Take(10000) // Limit to 10,000 records for performance
                .ToListAsync(ct);

            var csv = new StringBuilder();
            csv.AppendLine("Fecha/Hora,Tipo de Evento,Número de Serie,Realizado Por,Equipo,Voltaje,Descripción,Notas");

            foreach (var evt in events)
            {
                csv.AppendLine($"\"{evt.EventTimestamp:yyyy-MM-dd HH:mm:ss}\"," +
                              $"\"{TranslateEventType(evt.EventType)}\"," +
                              $"\"{evt.SerialNumber}\"," +
                              $"\"{evt.PerformedBy}\"," +
                              $"\"{evt.EquipoCodigo ?? "-"}\"," +
                              $"\"{(evt.VoltageReading.HasValue ? $"{evt.VoltageReading:F2}V" : "-")}\"," +
                              $"\"{evt.EventDescription.Replace("\"", "\"\"")}\"," +
                              $"\"{evt.Notes?.Replace("\"", "\"\"") ?? "-"}\"");
            }

            return File(
                Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv",
                $"Auditoria_Baterias_{DateTime.Now:yyyyMMdd_HHmm}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exportando auditoría a CSV");
            return StatusCode(500, "Error generando el reporte");
        }
    }

    private static string TranslateEventType(string eventType)
    {
        return eventType switch
        {
            "BatteryRegistered" => "Batería Registrada",
            "BatteryInstalled" => "Batería Instalada",
            "MaintenanceRecorded" => "Mantenimiento Registrado",
            "BatteryRemoved" => "Batería Removida",
            "BatteryReplaced" => "Batería Reemplazada",
            "BatteryDisposed" => "Batería Desechada",
            _ => eventType
        };
    }
}

// Response DTO
public record AuditEventResponse(
    List<AuditLogEntry> Events,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
