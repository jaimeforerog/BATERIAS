using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class RemoveBatteryHandler : IRequestHandler<RemoveBatteryCommand>
{
    private readonly IDocumentSession _session;

    public RemoveBatteryHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task Handle(RemoveBatteryCommand command, CancellationToken ct)
    {
        var battery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (battery == null)
            throw new InvalidOperationException($"Battery {command.BatteryId} not found");

        battery.Remove(
            command.Reason,
            command.Notes,
            command.RemovedBy
        );

        _session.Events.Append(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);
    }
}
