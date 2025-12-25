namespace Baterias.Domain.ValueObjects;

public enum HealthStatus
{
    Excellent,  // 100-90%
    Good,       // 89-75%
    Fair,       // 74-60%
    Poor,       // 59-40%
    Critical    // <40%
}
