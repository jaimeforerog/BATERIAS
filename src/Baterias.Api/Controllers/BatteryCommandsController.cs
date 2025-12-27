using Baterias.Application.Commands;
using Baterias.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace Baterias.Api.Controllers;

[ApiController]
[Route("api/batteries")]
public class BatteryCommandsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<BatteryCommandsController> _logger;

    public BatteryCommandsController(
        IMediator mediator,
        ILogger<BatteryCommandsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Registra una nueva batería en el inventario sin instalarla
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterBattery(
        [FromBody] RegisterBatteryRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new RegisterBatteryCommand(
                request.BatteryId ?? Guid.NewGuid(),
                request.SerialNumber,
                request.Model,
                request.Brand,
                request.RegistrationDate,
                request.RegisteredBy
            );

            var batteryId = await _mediator.Send(command, ct);

            _logger.LogInformation("Batería {BatteryId} registrada en el inventario", batteryId);

            return CreatedAtAction(
                nameof(BatteryQueriesController.GetBattery),
                "BatteryQueries",
                new { id = batteryId },
                new { BatteryId = batteryId }
            );
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al registrar batería");
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para registro de batería");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Instala una nueva batería en un vehículo
    /// </summary>
    [HttpPost("install")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> InstallBattery(
        [FromBody] InstallBatteryRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new InstallBatteryCommand(
                request.BatteryId ?? Guid.NewGuid(),
                request.SerialNumber,
                request.Model,
                request.EquipoId,
                request.EquipoCodigo,
                request.InstallationDate,
                request.InitialVoltage,
                request.InstalledBy
            );

            var batteryId = await _mediator.Send(command, ct);

            _logger.LogInformation("Batería {BatteryId} instalada en equipo {EquipoId}",
                batteryId, request.EquipoId);

            return CreatedAtAction(
                nameof(BatteryQueriesController.GetBattery),
                "BatteryQueries",
                new { id = batteryId },
                new { BatteryId = batteryId }
            );
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al instalar batería");
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para instalación de batería");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Registra un mantenimiento para una batería
    /// </summary>
    [HttpPost("{id}/maintenance")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordMaintenance(
        Guid id,
        [FromBody] RecordMaintenanceRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new RecordMaintenanceCommand(
                id,
                request.MaintenanceDate,
                request.Type,
                request.VoltageReading,
                request.HealthStatus,
                request.Notes,
                request.PerformedBy
            );

            await _mediator.Send(command, ct);

            _logger.LogInformation("Mantenimiento registrado para batería {BatteryId}", id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al registrar mantenimiento para batería {BatteryId}", id);
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para registro de mantenimiento");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Reemplaza una batería en un vehículo
    /// </summary>
    [HttpPost("replace")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReplaceBattery(
        [FromBody] ReplaceBatteryRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new ReplaceBatteryCommand(
                request.OldBatteryId,
                request.NewBatteryId ?? Guid.NewGuid(),
                request.NewBatterySerialNumber,
                request.NewBatteryModel,
                request.EquipoId,
                request.EquipoCodigo,
                request.Reason,
                request.NewBatteryInitialVoltage,
                request.ReplacedBy
            );

            var newBatteryId = await _mediator.Send(command, ct);

            _logger.LogInformation("Batería {OldBatteryId} reemplazada con {NewBatteryId} en equipo {EquipoId}",
                request.OldBatteryId, newBatteryId, request.EquipoId);

            return Ok(new { NewBatteryId = newBatteryId });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al reemplazar batería");
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para reemplazo de batería");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Remueve una batería instalada sin reemplazarla
    /// </summary>
    [HttpPost("{id}/remove")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveBattery(
        Guid id,
        [FromBody] RemoveBatteryRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new RemoveBatteryCommand(
                id,
                request.Reason,
                request.Notes,
                request.RemovedBy
            );

            await _mediator.Send(command, ct);

            _logger.LogInformation("Batería {BatteryId} removida", id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al remover batería {BatteryId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para remoción de batería");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Desecha una batería removida
    /// </summary>
    [HttpPost("{id}/dispose")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DisposeBattery(
        Guid id,
        [FromBody] DisposeBatteryRequest request,
        CancellationToken ct)
    {
        try
        {
            var command = new DisposeBatteryCommand(
                id,
                request.DisposalDate,
                request.DisposalReason,
                request.Notes,
                request.DisposedBy
            );

            await _mediator.Send(command, ct);

            _logger.LogInformation("Batería {BatteryId} desechada", id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error al desechar batería {BatteryId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos para desecho de batería");
            return BadRequest(new { error = ex.Message });
        }
    }
}

// Request DTOs
public record RegisterBatteryRequest(
    Guid? BatteryId,
    string SerialNumber,
    string Model,
    string Brand,
    DateTime RegistrationDate,
    string RegisteredBy
);

public record InstallBatteryRequest(
    Guid? BatteryId,
    string SerialNumber,
    string Model,
    int EquipoId,
    string EquipoCodigo,
    DateTime InstallationDate,
    decimal InitialVoltage,
    string InstalledBy
);

public record RecordMaintenanceRequest(
    DateTime MaintenanceDate,
    MaintenanceType Type,
    decimal VoltageReading,
    HealthStatus HealthStatus,
    string Notes,
    string PerformedBy
);

public record ReplaceBatteryRequest(
    Guid OldBatteryId,
    Guid? NewBatteryId,
    string NewBatterySerialNumber,
    string NewBatteryModel,
    int EquipoId,
    string EquipoCodigo,
    BatteryRemovalReason Reason,
    decimal NewBatteryInitialVoltage,
    string ReplacedBy
);

public record RemoveBatteryRequest(
    BatteryRemovalReason Reason,
    string Notes,
    string RemovedBy
);

public record DisposeBatteryRequest(
    DateTime DisposalDate,
    string DisposalReason,
    string Notes,
    string DisposedBy
);
