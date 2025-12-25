using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;
using Marten.Events;
using Marten.Events.Projections;

namespace Baterias.Application.Projections;

public class EquipoBatteryProjection
{
    public int Id { get; set; }  // EquipoId
    public string EquipoCodigo { get; set; } = string.Empty;
    public Guid? CurrentBatteryId { get; set; }
    public string? CurrentBatterySerialNumber { get; set; }
    public DateTime? CurrentBatteryInstallDate { get; set; }
    public List<BatteryHistoryEntry> BatteryHistory { get; set; } = new();
}

public class BatteryHistoryEntry
{
    public Guid BatteryId { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public DateTime InstalledDate { get; set; }
    public DateTime? RemovedDate { get; set; }
    public BatteryRemovalReason? RemovalReason { get; set; }
}

public class EquipoBatteryProjectionHandler : EventProjection
{
    public EquipoBatteryProjection Create(BatteryInstalled @event)
    {
        return new EquipoBatteryProjection
        {
            Id = @event.EquipoId,
            EquipoCodigo = @event.EquipoCodigo,
            CurrentBatteryId = @event.BatteryId,
            CurrentBatterySerialNumber = @event.BatterySerialNumber,
            CurrentBatteryInstallDate = @event.InstallationDate,
            BatteryHistory = new List<BatteryHistoryEntry>
            {
                new()
                {
                    BatteryId = @event.BatteryId,
                    SerialNumber = @event.BatterySerialNumber,
                    InstalledDate = @event.InstallationDate
                }
            }
        };
    }

    public EquipoBatteryProjection Apply(BatteryInstalled @event, EquipoBatteryProjection projection)
    {
        projection.CurrentBatteryId = @event.BatteryId;
        projection.CurrentBatterySerialNumber = @event.BatterySerialNumber;
        projection.CurrentBatteryInstallDate = @event.InstallationDate;
        projection.EquipoCodigo = @event.EquipoCodigo;

        projection.BatteryHistory.Add(new BatteryHistoryEntry
        {
            BatteryId = @event.BatteryId,
            SerialNumber = @event.BatterySerialNumber,
            InstalledDate = @event.InstallationDate
        });

        return projection;
    }

    public EquipoBatteryProjection Apply(BatteryReplaced @event, EquipoBatteryProjection projection)
    {
        var oldEntry = projection.BatteryHistory
            .FirstOrDefault(x => x.BatteryId == @event.OldBatteryId);

        if (oldEntry != null)
        {
            oldEntry.RemovedDate = @event.ReplacementDate;
            oldEntry.RemovalReason = @event.Reason;
        }

        projection.CurrentBatteryId = @event.NewBatteryId;
        projection.CurrentBatteryInstallDate = @event.ReplacementDate;
        // Note: CurrentBatterySerialNumber will be updated when the new battery install event is processed

        return projection;
    }
}
