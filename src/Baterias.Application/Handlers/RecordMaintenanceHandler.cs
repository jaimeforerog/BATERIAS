using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class RecordMaintenanceHandler : IRequestHandler<RecordMaintenanceCommand>
{
    private readonly IDocumentSession _session;

    public RecordMaintenanceHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task Handle(RecordMaintenanceCommand command, CancellationToken ct)
    {
        var battery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (battery == null)
            throw new InvalidOperationException($"Battery {command.BatteryId} not found");

        battery.RecordMaintenance(
            command.Type,
            command.VoltageReading,
            command.HealthStatus,
            command.Notes,
            command.PerformedBy
        );

        _session.Events.Append(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);
    }
}
