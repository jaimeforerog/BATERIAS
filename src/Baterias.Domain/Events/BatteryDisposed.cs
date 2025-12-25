namespace Baterias.Domain.Events;

public record BatteryDisposed(
    Guid BatteryId,
    DateTime DisposalDate,
    string DisposalReason,
    string Notes,
    string DisposedBy
);
