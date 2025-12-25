using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class ReplaceBatteryHandler : IRequestHandler<ReplaceBatteryCommand, Guid>
{
    private readonly IDocumentSession _session;

    public ReplaceBatteryHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task<Guid> Handle(ReplaceBatteryCommand command, CancellationToken ct)
    {
        // Load old battery
        var oldBattery = await _session.Events
            .AggregateStreamAsync<Battery>(command.OldBatteryId, token: ct);

        if (oldBattery == null)
            throw new InvalidOperationException($"Old battery {command.OldBatteryId} not found");

        // Load new battery (must exist)
        var newBattery = await _session.Events
            .AggregateStreamAsync<Battery>(command.NewBatteryId, token: ct);

        if (newBattery == null)
            throw new InvalidOperationException($"La nueva batería {command.NewBatteryId} no está registrada. Por favor regístrela primero.");

        // Replace old battery
        oldBattery.Replace(command.NewBatteryId, command.Reason, command.ReplacedBy);

        // Install new battery
        newBattery.Install(
            command.EquipoId,
            command.EquipoCodigo,
            command.NewBatteryInitialVoltage,
            command.ReplacedBy
        );

        _session.Events.Append(command.OldBatteryId, oldBattery.UncommittedEvents.ToArray());
        _session.Events.Append(command.NewBatteryId, newBattery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);

        return command.NewBatteryId;
    }
}
