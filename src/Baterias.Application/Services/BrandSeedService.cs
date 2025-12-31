using Baterias.Application.Documents;
using Marten;

namespace Baterias.Application.Services;

/// <summary>
/// Servicio para inicializar las marcas de baterías predefinidas
/// </summary>
public class BrandSeedService
{
    private readonly IDocumentSession _session;

    public BrandSeedService(IDocumentSession session)
    {
        _session = session;
    }

    /// <summary>
    /// Marcas predefinidas de baterías
    /// </summary>
    public static readonly BatteryBrandDocument[] PredefinedBrands = new[]
    {
        new BatteryBrandDocument { Id = 1, Name = "BOSCH", Category = "Premium Internacional" },
        new BatteryBrandDocument { Id = 2, Name = "Varta", Category = "Premium Internacional" },
        new BatteryBrandDocument { Id = 3, Name = "Optima", Category = "Premium Internacional" },
        new BatteryBrandDocument { Id = 4, Name = "ACDelco", Category = "Premium Internacional" },
        new BatteryBrandDocument { Id = 5, Name = "Interstate Batteries", Category = "Premium Internacional" },
        new BatteryBrandDocument { Id = 6, Name = "MAC", Category = "América Latina" },
        new BatteryBrandDocument { Id = 7, Name = "Willard", Category = "América Latina" },
        new BatteryBrandDocument { Id = 8, Name = "LTH", Category = "América Latina" },
        new BatteryBrandDocument { Id = 9, Name = "Duncan", Category = "América Latina" },
        new BatteryBrandDocument { Id = 10, Name = "Titan", Category = "América Latina" },
        new BatteryBrandDocument { Id = 11, Name = "Exide", Category = "Internacional" },
        new BatteryBrandDocument { Id = 12, Name = "Yuasa", Category = "Internacional" },
        new BatteryBrandDocument { Id = 13, Name = "Amaron", Category = "Internacional" },
        new BatteryBrandDocument { Id = 14, Name = "Motorcraft", Category = "OEM - Ford" },
        new BatteryBrandDocument { Id = 15, Name = "Moura", Category = "Internacional" },
        new BatteryBrandDocument { Id = 16, Name = "GS Yuasa", Category = "Asiática" },
        new BatteryBrandDocument { Id = 17, Name = "Panasonic", Category = "Asiática" },
        new BatteryBrandDocument { Id = 18, Name = "Rocket", Category = "Asiática" }
    };

    /// <summary>
    /// Inicializa las marcas en la base de datos si no existen
    /// </summary>
    public async Task SeedBrandsIfNeededAsync(CancellationToken cancellationToken = default)
    {
        var existingCount = await _session.Query<BatteryBrandDocument>().CountAsync(cancellationToken);

        if (existingCount == 0)
        {
            foreach (var brand in PredefinedBrands)
            {
                _session.Store(brand);
            }

            await _session.SaveChangesAsync(cancellationToken);
        }
    }
}
