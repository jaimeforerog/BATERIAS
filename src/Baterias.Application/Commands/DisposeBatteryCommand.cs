using MediatR;

namespace Baterias.Application.Commands;

public record DisposeBatteryCommand(
    Guid BatteryId,
    DateTime DisposalDate,
    string DisposalReason,
    string Notes,
    string DisposedBy
) : IRequest;
