using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;
using Marten.Events;
using Marten.Events.Aggregation;

namespace Baterias.Application.Projections;

public class BatteryStatusProjection
{
    public Guid Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;

    // New brand fields (ID-based)
    public int BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string BrandCategory { get; set; } = string.Empty;

    // Deprecated - kept for backward compatibility during migration
    [Obsolete("Use BrandId, BrandName, and BrandCategory instead")]
    public string Brand { get; set; } = string.Empty;

    public DateTime RegistrationDate { get; set; }
    public BatteryStatus Status { get; set; }
    public int? CurrentEquipoId { get; set; }
    public string? EquipoCodigo { get; set; }
    public DateTime? InstallationDate { get; set; }
    public decimal? LastVoltageReading { get; set; }
    public HealthStatus? CurrentHealthStatus { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public int MaintenanceCount { get; set; }
}

public class BatteryStatusProjectionHandler : SingleStreamProjection<BatteryStatusProjection, Guid>
{
    public void Apply(BatteryRegistered @event, BatteryStatusProjection projection)
    {
        projection.Id = @event.BatteryId;
        projection.SerialNumber = @event.SerialNumber;
        projection.Model = @event.Model;

        // Handle both new events (BrandId as string) and legacy events (Brand name)
        projection.Brand = @event.Brand; // Keep for backward compatibility

        // Try to parse as BrandId (new events)
        if (int.TryParse(@event.Brand, out int brandId))
        {
            projection.BrandId = brandId;
            // BrandName and BrandCategory will be populated by query layer
        }
        // Legacy events with brand names will be handled by migration script

        projection.RegistrationDate = @event.RegistrationDate;
        projection.Status = BatteryStatus.New;
    }

    public void Apply(BatteryInstalled @event, BatteryStatusProjection projection)
    {
        projection.Id = @event.BatteryId;
        projection.SerialNumber = @event.BatterySerialNumber;
        projection.Model = @event.BatteryModel;
        projection.CurrentEquipoId = @event.EquipoId;
        projection.EquipoCodigo = @event.EquipoCodigo;
        projection.InstallationDate = @event.InstallationDate;
        projection.LastVoltageReading = @event.InitialVoltage;
        projection.Status = BatteryStatus.Installed;
    }

    public void Apply(MaintenanceRecorded @event, BatteryStatusProjection projection)
    {
        projection.LastVoltageReading = @event.VoltageReading;
        projection.CurrentHealthStatus = @event.HealthStatus;
        projection.LastMaintenanceDate = @event.MaintenanceDate;
        projection.MaintenanceCount++;
    }

    public void Apply(BatteryReplaced @event, BatteryStatusProjection projection)
    {
        projection.Status = BatteryStatus.Removed;
        projection.CurrentEquipoId = null;
        projection.EquipoCodigo = null;
        projection.LastVoltageReading = @event.FinalVoltage;
    }

    public void Apply(BatteryRemoved @event, BatteryStatusProjection projection)
    {
        projection.Status = BatteryStatus.Removed;
        projection.CurrentEquipoId = null;
        projection.EquipoCodigo = null;
        projection.LastVoltageReading = @event.FinalVoltage;
    }

    public void Apply(BatteryDisposed @event, BatteryStatusProjection projection)
    {
        projection.Status = BatteryStatus.Disposed;
    }
}
