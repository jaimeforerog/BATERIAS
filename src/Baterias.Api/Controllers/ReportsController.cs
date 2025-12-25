using Baterias.Application.Projections;
using ClosedXML.Excel;
using Marten;
using Microsoft.AspNetCore.Mvc;

namespace Baterias.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IQuerySession _querySession;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IQuerySession querySession, ILogger<ReportsController> logger)
    {
        _querySession = querySession;
        _logger = logger;
    }

    [HttpGet("batteries/excel")]
    public async Task<IActionResult> ExportBatteriesToExcel(CancellationToken ct)
    {
        try
        {
            var batteries = await _querySession.Query<BatteryStatusProjection>()
                .OrderByDescending(b => b.RegistrationDate)
                .ToListAsync(ct);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Inventario de Baterías");

            // Headers
            worksheet.Cell(1, 1).Value = "Número de Serie";
            worksheet.Cell(1, 2).Value = "Marca";
            worksheet.Cell(1, 3).Value = "Modelo";
            worksheet.Cell(1, 4).Value = "Estado";
            worksheet.Cell(1, 5).Value = "Fecha Registro";
            worksheet.Cell(1, 6).Value = "Ultimo Voltaje (V)";
            worksheet.Cell(1, 7).Value = "Estado de Salud";
            worksheet.Cell(1, 8).Value = "Mantenimientos";
            worksheet.Cell(1, 9).Value = "Ultimo Mantenimiento";
            worksheet.Cell(1, 10).Value = "Equipo Actual";

            // Style Headers
            var headerRange = worksheet.Range(1, 1, 1, 10);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // Data
            int row = 2;
            foreach (var battery in batteries)
            {
                worksheet.Cell(row, 1).Value = battery.SerialNumber;
                worksheet.Cell(row, 2).Value = battery.Brand;
                worksheet.Cell(row, 3).Value = battery.Model;
                worksheet.Cell(row, 4).Value = battery.Status.ToString();
                worksheet.Cell(row, 5).Value = battery.RegistrationDate.ToString("yyyy-MM-dd");
                worksheet.Cell(row, 6).Value = battery.LastVoltageReading.HasValue ? battery.LastVoltageReading.Value : "N/A";
                worksheet.Cell(row, 7).Value = battery.CurrentHealthStatus.HasValue ? battery.CurrentHealthStatus.Value.ToString() : "N/A";
                worksheet.Cell(row, 8).Value = battery.MaintenanceCount;
                worksheet.Cell(row, 9).Value = battery.LastMaintenanceDate.HasValue ? battery.LastMaintenanceDate.Value.ToString("yyyy-MM-dd") : "Nunca";
                worksheet.Cell(row, 10).Value = !string.IsNullOrEmpty(battery.EquipoCodigo) ? battery.EquipoCodigo : "N/A";
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(
                content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Baterias_Reporte_{DateTime.Now:yyyyMMdd_HHmm}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generando reporte de baterías");
            return StatusCode(500, "Error generando el reporte");
        }
    }
}
