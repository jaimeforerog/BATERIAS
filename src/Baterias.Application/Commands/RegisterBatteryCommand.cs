using MediatR;

namespace Baterias.Application.Commands;

public record RegisterBatteryCommand(
    Guid BatteryId,
    string SerialNumber,
    string Model,
    int BrandId,
    DateTime RegistrationDate,
    string RegisteredBy
) : IRequest<Guid>;
