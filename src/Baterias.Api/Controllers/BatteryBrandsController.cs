using Baterias.Application.Documents;
using Marten;
using Microsoft.AspNetCore.Mvc;

namespace Baterias.Api.Controllers;

/// <summary>
/// Controller para gestionar las marcas de baterías
/// </summary>
[ApiController]
[Route("api/battery-brands")]
public class BatteryBrandsController : ControllerBase
{
    private readonly IDocumentSession _session;

    public BatteryBrandsController(IDocumentSession session)
    {
        _session = session;
    }

    /// <summary>
    /// Obtiene todas las marcas de baterías disponibles
    /// </summary>
    /// <returns>Lista de marcas de baterías ordenadas por nombre</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<BatteryBrandDocument>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BatteryBrandDocument>>> GetBrands(CancellationToken cancellationToken)
    {
        var brands = await _session.Query<BatteryBrandDocument>()
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

        return Ok(brands);
    }
}
