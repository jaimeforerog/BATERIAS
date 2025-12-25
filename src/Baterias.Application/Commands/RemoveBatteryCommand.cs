using Baterias.Domain.ValueObjects;
using MediatR;

namespace Baterias.Application.Commands;

public record RemoveBatteryCommand(
    Guid BatteryId,
    BatteryRemovalReason Reason,
    string Notes,
    string RemovedBy
) : IRequest;
