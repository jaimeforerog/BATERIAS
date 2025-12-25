using Baterias.Domain.ValueObjects;

namespace Baterias.Domain.Events;

public record BatteryRemoved(
    Guid BatteryId,
    int EquipoId,
    DateTime RemovalDate,
    BatteryRemovalReason Reason,
    decimal FinalVoltage,
    string Notes,
    string RemovedBy
);
