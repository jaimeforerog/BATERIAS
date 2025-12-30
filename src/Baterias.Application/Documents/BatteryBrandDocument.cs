namespace Baterias.Application.Documents;

/// <summary>
/// Documento Marten para almacenar marcas de baterías
/// </summary>
public class BatteryBrandDocument
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
