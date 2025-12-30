namespace Baterias.Domain.ValueObjects;

/// <summary>
/// Representa una marca de batería con su categoría
/// </summary>
public record BatteryBrand(
    int Id,
    string Name,
    string Category
);
