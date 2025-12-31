using Baterias.Domain.Events;
using Marten.Events.Projections;

namespace Baterias.Application.Projections;

/// <summary>
/// Entrada de auditoría que representa cualquier evento del sistema
/// </summary>
public class AuditLogEntry
{
    public Guid Id { get; set; }  // Unique ID for this audit entry
    public Guid BatteryId { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;  // "BatteryRegistered", "BatteryInstalled", etc.
    public DateTime EventTimestamp { get; set; }
    public string PerformedBy { get; set; } = string.Empty;  // Who performed the action

    // Event-specific context (stored as JSON-friendly properties)
    public string? EquipoCodigo { get; set; }
    public int? EquipoId { get; set; }
    public decimal? VoltageReading { get; set; }
    public string? HealthStatus { get; set; }
    public string? MaintenanceType { get; set; }
    public string? RemovalReason { get; set; }
    public string? DisposalReason { get; set; }
    public string? Notes { get; set; }
    public string? Model { get; set; }
    public string? Brand { get; set; }

    // For search/display
    public string EventDescription { get; set; } = string.Empty;  // Human-readable description
}

/// <summary>
/// Handler que proyecta todos los eventos de baterías a entradas de auditoría
/// </summary>
public class AuditLogProjectionHandler : EventProjection
{
    public AuditLogEntry Create(BatteryRegistered @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.BatteryId,
            SerialNumber = @event.SerialNumber,
            EventType = "BatteryRegistered",
            EventTimestamp = @event.RegistrationDate,
            PerformedBy = @event.RegisteredBy,
            Model = @event.Model,
            Brand = @event.Brand,
            EventDescription = $"Batería {@event.SerialNumber} registrada - Modelo: {@event.Model}"
        };
    }

    public AuditLogEntry Create(BatteryInstalled @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.BatteryId,
            SerialNumber = @event.BatterySerialNumber,
            EventType = "BatteryInstalled",
            EventTimestamp = @event.InstallationDate,
            PerformedBy = @event.InstalledBy,
            EquipoCodigo = @event.EquipoCodigo,
            EquipoId = @event.EquipoId,
            VoltageReading = @event.InitialVoltage,
            Model = @event.BatteryModel,
            EventDescription = $"Batería instalada en equipo {@event.EquipoCodigo} - Voltaje inicial: {@event.InitialVoltage:F2}V"
        };
    }

    public AuditLogEntry Create(MaintenanceRecorded @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.BatteryId,
            SerialNumber = "", // Will be enriched if needed
            EventType = "MaintenanceRecorded",
            EventTimestamp = @event.MaintenanceDate,
            PerformedBy = @event.PerformedBy,
            VoltageReading = @event.VoltageReading,
            HealthStatus = @event.HealthStatus.ToString(),
            MaintenanceType = @event.Type.ToString(),
            Notes = @event.Notes,
            EventDescription = $"Mantenimiento {@event.Type} - Salud: {@event.HealthStatus}, Voltaje: {@event.VoltageReading:F2}V"
        };
    }

    public AuditLogEntry Create(BatteryRemoved @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.BatteryId,
            SerialNumber = "",
            EventType = "BatteryRemoved",
            EventTimestamp = @event.RemovalDate,
            PerformedBy = @event.RemovedBy,
            EquipoId = @event.EquipoId,
            VoltageReading = @event.FinalVoltage,
            RemovalReason = @event.Reason.ToString(),
            Notes = @event.Notes,
            EventDescription = $"Batería removida - Razón: {@event.Reason}, Voltaje final: {@event.FinalVoltage:F2}V"
        };
    }

    public AuditLogEntry Create(BatteryReplaced @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.OldBatteryId,
            SerialNumber = "",
            EventType = "BatteryReplaced",
            EventTimestamp = @event.ReplacementDate,
            PerformedBy = @event.ReplacedBy,
            EquipoId = @event.EquipoId,
            VoltageReading = @event.FinalVoltage,
            RemovalReason = @event.Reason.ToString(),
            EventDescription = $"Batería reemplazada - Nueva batería ID: {@event.NewBatteryId.ToString()[..8]}, Razón: {@event.Reason}"
        };
    }

    public AuditLogEntry Create(BatteryDisposed @event)
    {
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            BatteryId = @event.BatteryId,
            SerialNumber = "",
            EventType = "BatteryDisposed",
            EventTimestamp = @event.DisposalDate,
            PerformedBy = @event.DisposedBy,
            DisposalReason = @event.DisposalReason,
            Notes = @event.Notes,
            EventDescription = $"Batería desechada - Razón: {@event.DisposalReason}"
        };
    }
}
