using Baterias.Application.Commands;
using Baterias.Domain.Aggregates;
using Marten;
using MediatR;

namespace Baterias.Application.Handlers;

public class RegisterBatteryHandler : IRequestHandler<RegisterBatteryCommand, Guid>
{
    private readonly IDocumentSession _session;

    public RegisterBatteryHandler(IDocumentSession session)
    {
        _session = session;
    }

    public async Task<Guid> Handle(RegisterBatteryCommand command, CancellationToken ct)
    {
        var existingBattery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (existingBattery != null)
            throw new InvalidOperationException($"La batería {command.BatteryId} ya existe en el sistema");

        var duplicateSerial = await _session.Query<Baterias.Application.Projections.BatteryStatusProjection>()
            .Where(b => b.SerialNumber == command.SerialNumber)
            .FirstOrDefaultAsync(ct);

        if (duplicateSerial != null)
            throw new InvalidOperationException($"Ya existe una batería con el número de serie {command.SerialNumber}");

        var battery = Battery.Register(
            command.BatteryId,
            command.SerialNumber,
            command.Model,
            command.Brand,
            command.RegistrationDate,
            command.RegisteredBy
        );

        _session.Events.StartStream<Battery>(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);

        return command.BatteryId;
    }
}
