using Baterias.Domain.ValueObjects;

namespace Baterias.Domain.Events;

public record BatteryReplaced(
    Guid OldBatteryId,
    Guid NewBatteryId,
    int EquipoId,
    DateTime ReplacementDate,
    BatteryRemovalReason Reason,
    decimal FinalVoltage,
    string ReplacedBy
);
