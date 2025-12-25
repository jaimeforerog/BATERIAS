using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;
using Marten.Events.Projections;

namespace Baterias.Application.Projections;

public class MaintenanceHistoryProjection
{
    public Guid Id { get; set; }  // MaintenanceId
    public Guid BatteryId { get; set; }
    public DateTime MaintenanceDate { get; set; }
    public MaintenanceType Type { get; set; }
    public decimal VoltageReading { get; set; }
    public HealthStatus HealthStatus { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
}

public class MaintenanceHistoryProjectionHandler : EventProjection
{
    public MaintenanceHistoryProjection Create(MaintenanceRecorded @event)
    {
        return new MaintenanceHistoryProjection
        {
            Id = @event.MaintenanceId,
            BatteryId = @event.BatteryId,
            MaintenanceDate = @event.MaintenanceDate,
            Type = @event.Type,
            VoltageReading = @event.VoltageReading,
            HealthStatus = @event.HealthStatus,
            Notes = @event.Notes,
            PerformedBy = @event.PerformedBy
        };
    }
}
