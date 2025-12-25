using Baterias.Domain.ValueObjects;

namespace Baterias.Domain.Events;

public record MaintenanceRecorded(
    Guid BatteryId,
    Guid MaintenanceId,
    DateTime MaintenanceDate,
    MaintenanceType Type,
    decimal VoltageReading,
    HealthStatus HealthStatus,
    string Notes,
    string PerformedBy
);
