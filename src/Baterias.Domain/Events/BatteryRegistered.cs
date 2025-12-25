namespace Baterias.Domain.Events;

public record BatteryRegistered(
    Guid BatteryId,
    string SerialNumber,
    string Model,
    string Brand,
    DateTime RegistrationDate,
    string RegisteredBy
);
