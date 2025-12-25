namespace Baterias.Domain.Events;

public record BatteryInstalled(
    Guid BatteryId,
    string BatterySerialNumber,
    string BatteryModel,
    int EquipoId,
    string EquipoCodigo,
    DateTime InstallationDate,
    decimal InitialVoltage,
    string InstalledBy
);
