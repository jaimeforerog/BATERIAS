using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class InstallBatteryHandler : IRequestHandler<InstallBatteryCommand, Guid>
{
    private readonly IDocumentSession _session;

    public InstallBatteryHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task<Guid> Handle(InstallBatteryCommand command, CancellationToken ct)
    {
        var battery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (battery == null)
            throw new InvalidOperationException($"La batería {command.BatteryId} no está registrada. Por favor regístrela primero.");

        battery.Install(
            command.EquipoId,
            command.EquipoCodigo,
            command.InitialVoltage,
            command.InstalledBy
        );

        _session.Events.Append(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);

        return command.BatteryId;
    }
}
