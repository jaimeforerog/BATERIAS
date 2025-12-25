using MediatR;

namespace Baterias.Application.Commands;

public record InstallBatteryCommand(
    Guid BatteryId,
    string SerialNumber,
    string Model,
    int EquipoId,
    string EquipoCodigo,
    decimal InitialVoltage,
    string InstalledBy
) : IRequest<Guid>;
