using Baterias.Application.Documents;
using Baterias.Application.Projections;
using Baterias.Domain.ValueObjects;
using Marten;
using Microsoft.AspNetCore.Mvc;

namespace Baterias.Api.Controllers;

[ApiController]
[Route("api/batteries")]
public class BatteryQueriesController : ControllerBase
{
    private readonly IDocumentSession _session;
    private readonly ILogger<BatteryQueriesController> _logger;

    public BatteryQueriesController(
        IDocumentSession session,
        ILogger<BatteryQueriesController> logger)
    {
        _session = session;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene una batería por ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BatteryStatusProjection>> GetBattery(
        Guid id,
        CancellationToken ct)
    {
        var battery = await _session.LoadAsync<BatteryStatusProjection>(id, ct);

        if (battery == null)
        {
            _logger.LogWarning("Batería {BatteryId} no encontrada", id);
            return NotFound(new { error = $"Batería {id} no encontrada" });
        }

        // Enrich with brand information
        await EnrichWithBrandInfo(battery, ct);

        return Ok(battery);
    }

    /// <summary>
    /// Obtiene todas las baterías con filtro opcional de estado
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BatteryStatusProjection>>> GetAllBatteries(
        [FromQuery] BatteryStatus? status,
        CancellationToken ct)
    {
        IReadOnlyList<BatteryStatusProjection> batteries;

        if (status.HasValue)
        {
            _logger.LogInformation("Consultando baterías con estado {Status}", status.Value);
            batteries = await _session.Query<BatteryStatusProjection>()
                .Where(b => b.Status == status.Value)
                .ToListAsync(ct);
        }
        else
        {
            _logger.LogInformation("Consultando todas las baterías");
            batteries = await _session.Query<BatteryStatusProjection>()
                .ToListAsync(ct);
        }

        // Enrich all batteries with brand information
        foreach (var battery in batteries)
        {
            await EnrichWithBrandInfo(battery, ct);
        }

        return Ok(batteries);
    }

    /// <summary>
    /// Obtiene el historial de mantenimientos de una batería
    /// </summary>
    [HttpGet("{id}/maintenance-history")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<MaintenanceHistoryProjection>>> GetMaintenanceHistory(
        Guid id,
        CancellationToken ct)
    {
        _logger.LogInformation("Consultando historial de mantenimientos para batería {BatteryId}", id);

        var history = await _session.Query<MaintenanceHistoryProjection>()
            .Where(m => m.BatteryId == id)
            .OrderByDescending(m => m.MaintenanceDate)
            .ToListAsync(ct);

        return Ok(history);
    }

    /// <summary>
    /// Obtiene la batería actual de un equipo
    /// </summary>
    [HttpGet("~/api/equipos/{equipoId}/bateria")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EquipoBatteryProjection>> GetEquipoBattery(
        int equipoId,
        CancellationToken ct)
    {
        _logger.LogInformation("Consultando batería para equipo {EquipoId}", equipoId);

        var equipoBattery = await _session.LoadAsync<EquipoBatteryProjection>(equipoId, ct);

        if (equipoBattery == null)
        {
            _logger.LogWarning("Equipo {EquipoId} no encontrado o no tiene batería", equipoId);
            return NotFound(new { error = $"Equipo {equipoId} no encontrado o no tiene batería" });
        }

        return Ok(equipoBattery);
    }

    /// <summary>
    /// Obtiene el stream de eventos de una batería (debugging/auditoría)
    /// </summary>
    [HttpGet("{id}/events")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBatteryEvents(
        Guid id,
        CancellationToken ct)
    {
        _logger.LogInformation("Consultando stream de eventos para batería {BatteryId}", id);

        var events = await _session.Events.FetchStreamAsync(id, token: ct);

        var eventData = events.Select(e => new
        {
            EventType = e.Data.GetType().Name,
            Timestamp = e.Timestamp,
            Version = e.Version,
            Data = e.Data
        });

        return Ok(eventData);
    }

    /// <summary>
    /// Enriquece una batería con información de marca desde BatteryBrandDocument
    /// </summary>
    private async Task EnrichWithBrandInfo(BatteryStatusProjection battery, CancellationToken ct)
    {
        if (battery.BrandId > 0)
        {
            var brandDoc = await _session.LoadAsync<BatteryBrandDocument>(battery.BrandId, ct);
            if (brandDoc != null)
            {
                battery.BrandName = brandDoc.Name;
                battery.BrandCategory = brandDoc.Category;
            }
        }
        else if (!string.IsNullOrEmpty(battery.Brand))
        {
            // Handle legacy batteries with text-based Brand field
            battery.BrandName = battery.Brand;
            battery.BrandCategory = "Sin categoría";
        }
    }
}
