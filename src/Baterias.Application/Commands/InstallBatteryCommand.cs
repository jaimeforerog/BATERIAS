using MediatR;

namespace Baterias.Application.Commands;

public record InstallBatteryCommand(
    Guid BatteryId,
    string SerialNumber,
    string Model,
    int EquipoId,
    string EquipoCodigo,
    DateTime InstallationDate,
    decimal InitialVoltage,
    string InstalledBy
) : IRequest<Guid>;
