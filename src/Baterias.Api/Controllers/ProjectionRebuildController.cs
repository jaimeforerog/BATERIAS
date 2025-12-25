using Marten;
using Microsoft.AspNetCore.Mvc;

namespace Baterias.Api.Controllers;

[ApiController]
[Route("api/projections")]
public class ProjectionRebuildController : ControllerBase
{
    private readonly IDocumentStore _store;
    private readonly ILogger<ProjectionRebuildController> _logger;

    public ProjectionRebuildController(IDocumentStore store, ILogger<ProjectionRebuildController> logger)
    {
        _store = store;
        _logger = logger;
    }

    /// <summary>
    /// Reconstruye todas las proyecciones desde el Event Store
    /// </summary>
    [HttpPost("rebuild")]
    public async Task<IActionResult> RebuildProjections()
    {
        _logger.LogInformation("Iniciando reconstrucción de proyecciones...");

        try
        {
            using var daemon = await _store.BuildProjectionDaemonAsync();

            // Rebuild all projections from scratch
            await daemon.RebuildProjectionAsync<Baterias.Application.Projections.BatteryStatusProjection>(CancellationToken.None);

            _logger.LogInformation("Proyecciones reconstruidas exitosamente");

            return Ok(new { message = "Proyecciones reconstruidas exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reconstruir proyecciones");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el estado actual de las proyecciones
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetProjectionStatus()
    {
        try
        {
            await using var session = _store.LightweightSession();

            var batteryCount = await session.Query<Baterias.Application.Projections.BatteryStatusProjection>().CountAsync();

            return Ok(new
            {
                batteryProjections = batteryCount,
                message = $"Total de proyecciones de baterías: {batteryCount}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estado de proyecciones");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
