using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class DisposeBatteryHandler : IRequestHandler<DisposeBatteryCommand>
{
    private readonly IDocumentSession _session;

    public DisposeBatteryHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task Handle(DisposeBatteryCommand command, CancellationToken ct)
    {
        var battery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (battery == null)
            throw new InvalidOperationException($"Battery {command.BatteryId} not found");

        battery.Dispose(
            command.DisposalDate,
            command.DisposalReason,
            command.Notes,
            command.DisposedBy
        );

        _session.Events.Append(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);
    }
}
