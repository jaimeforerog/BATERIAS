using Baterias.Application.Documents;
using Marten;

namespace Baterias.Application.Services;

/// <summary>
/// Servicio para resolver IDs de marca desde strings (legacy) o IDs (nuevos)
/// </summary>
public class BrandLookupService
{
    private readonly IDocumentSession _session;
    private Dictionary<string, int>? _brandNameToIdCache;

    public BrandLookupService(IDocumentSession session)
    {
        _session = session;
    }

    /// <summary>
    /// Convierte un valor de marca (puede ser ID como string o nombre legacy) a BrandId
    /// </summary>
    /// <param name="brandValue">Valor de marca del evento (puede ser "1" o "MAC")</param>
    /// <param name="ct">Token de cancelación</param>
    /// <returns>ID de la marca, o null si no se encuentra</returns>
    public async Task<int?> GetBrandIdFromStringAsync(string brandValue, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(brandValue))
            return null;

        // Intentar parsear como ID primero (para eventos nuevos)
        if (int.TryParse(brandValue, out int brandId))
        {
            return brandId;
        }

        // Búsqueda legacy por nombre
        if (_brandNameToIdCache == null)
        {
            await InitializeCacheAsync(ct);
        }

        if (_brandNameToIdCache!.TryGetValue(brandValue, out int id))
        {
            return id;
        }

        // Marca desconocida - retornar null (el caller puede decidir qué hacer)
        return null;
    }

    private async Task InitializeCacheAsync(CancellationToken ct)
    {
        var brands = await _session.Query<BatteryBrandDocument>().ToListAsync(ct);
        _brandNameToIdCache = brands.ToDictionary(
            b => b.Name,
            b => b.Id,
            StringComparer.OrdinalIgnoreCase
        );
    }
}
