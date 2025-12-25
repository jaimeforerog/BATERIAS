using Baterias.Domain.ValueObjects;
using MediatR;

namespace Baterias.Application.Commands;

public record ReplaceBatteryCommand(
    Guid OldBatteryId,
    Guid NewBatteryId,
    string NewBatterySerialNumber,
    string NewBatteryModel,
    int EquipoId,
    string EquipoCodigo,
    BatteryRemovalReason Reason,
    decimal NewBatteryInitialVoltage,
    string ReplacedBy
) : IRequest<Guid>;
