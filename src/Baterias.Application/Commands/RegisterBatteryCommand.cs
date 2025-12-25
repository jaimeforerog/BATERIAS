using MediatR;

namespace Baterias.Application.Commands;

public record RegisterBatteryCommand(
    Guid BatteryId,
    string SerialNumber,
    string Model,
    string Brand,
    DateTime RegistrationDate,
    string RegisteredBy
) : IRequest<Guid>;
