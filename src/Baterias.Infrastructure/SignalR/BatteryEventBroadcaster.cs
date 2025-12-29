using Baterias.Domain.Events;
using Marten;
using Marten.Events;
using Marten.Services;
using Microsoft.AspNetCore.SignalR;

namespace Baterias.Infrastructure.SignalR;

/// <summary>
/// Listener de sesión de Marten que transmite eventos de baterías vía SignalR
/// </summary>
public class BatteryEventBroadcaster : DocumentSessionListenerBase
{
    private readonly IHubContext<BatteryHub> _hubContext;

    public BatteryEventBroadcaster(IHubContext<BatteryHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public override async Task AfterCommitAsync(IDocumentSession session, IChangeSet commit, CancellationToken token)
    {
        // Obtener todos los eventos guardados en este commit
        var events = commit.GetEvents().ToList();

        foreach (var evt in events)
        {
            // Transmitir cada tipo de evento vía SignalR
            await BroadcastEventAsync(evt.Data, token);
        }

        await base.AfterCommitAsync(session, commit, token);
    }

    private async Task BroadcastEventAsync(object eventData, CancellationToken token)
    {
        const string group = "BatteryUpdates";

        switch (eventData)
        {
            case BatteryRegistered e:
                await _hubContext.Clients.Group(group).SendAsync("BatteryRegistered", new
                {
                    e.BatteryId,
                    e.SerialNumber,
                    e.Model,
                    e.Brand,
                    e.RegistrationDate,
                    e.RegisteredBy
                }, token);
                break;

            case BatteryInstalled e:
                await _hubContext.Clients.Group(group).SendAsync("BatteryInstalled", new
                {
                    e.BatteryId,
                    e.BatterySerialNumber,
                    e.BatteryModel,
                    e.EquipoId,
                    e.EquipoCodigo,
                    e.InstallationDate,
                    e.InitialVoltage,
                    e.InstalledBy
                }, token);
                break;

            case MaintenanceRecorded e:
                await _hubContext.Clients.Group(group).SendAsync("MaintenanceRecorded", new
                {
                    e.BatteryId,
                    e.MaintenanceId,
                    e.MaintenanceDate,
                    e.RecordedAt,
                    Type = e.Type.ToString(),
                    e.VoltageReading,
                    HealthStatus = e.HealthStatus.ToString(),
                    e.Notes,
                    e.PerformedBy
                }, token);
                break;

            case BatteryRemoved e:
                await _hubContext.Clients.Group(group).SendAsync("BatteryRemoved", new
                {
                    e.BatteryId,
                    e.EquipoId,
                    e.RemovalDate,
                    Reason = e.Reason.ToString(),
                    e.FinalVoltage,
                    e.Notes,
                    e.RemovedBy
                }, token);
                break;

            case BatteryReplaced e:
                await _hubContext.Clients.Group(group).SendAsync("BatteryReplaced", new
                {
                    e.OldBatteryId,
                    e.NewBatteryId,
                    e.EquipoId,
                    e.ReplacementDate,
                    Reason = e.Reason.ToString(),
                    e.FinalVoltage,
                    e.ReplacedBy
                }, token);
                break;

            case BatteryDisposed e:
                await _hubContext.Clients.Group(group).SendAsync("BatteryDisposed", new
                {
                    e.BatteryId,
                    e.DisposalDate,
                    e.DisposalReason,
                    e.Notes,
                    e.DisposedBy
                }, token);
                break;
        }
    }
}
