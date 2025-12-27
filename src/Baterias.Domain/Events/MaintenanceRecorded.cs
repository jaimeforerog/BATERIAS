using Baterias.Domain.ValueObjects;

namespace Baterias.Domain.Events;

public record MaintenanceRecorded(
    Guid BatteryId,
    Guid MaintenanceId,
    DateTime MaintenanceDate,        // Fecha en que se realizó el mantenimiento
    DateTime RecordedAt,              // Fecha en que se registró en el sistema (para logs)
    MaintenanceType Type,
    decimal VoltageReading,
    HealthStatus HealthStatus,
    string Notes,
    string PerformedBy
);
