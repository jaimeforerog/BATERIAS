using Baterias.Application.Commands;
using Baterias.Application.Documents;
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
        // Validate brand exists
        var brand = await _session.LoadAsync<BatteryBrandDocument>(command.BrandId, ct);
        if (brand == null)
            throw new ArgumentException($"Marca inválida. El ID {command.BrandId} no existe", nameof(command.BrandId));

        var existingBattery = await _session.Events
            .AggregateStreamAsync<Battery>(command.BatteryId, token: ct);

        if (existingBattery != null)
            throw new InvalidOperationException($"La batería {command.BatteryId} ya existe en el sistema");

        var duplicateSerial = await _session.Query<Baterias.Application.Projections.BatteryStatusProjection>()
            .Where(b => b.SerialNumber == command.SerialNumber)
            .FirstOrDefaultAsync(ct);

        if (duplicateSerial != null)
            throw new InvalidOperationException($"Ya existe una batería con el número de serie {command.SerialNumber}");

        // Convert BrandId to string for event (backward compatibility)
        var battery = Battery.Register(
            command.BatteryId,
            command.SerialNumber,
            command.Model,
            command.BrandId.ToString(),
            command.RegistrationDate,
            command.RegisteredBy
        );

        _session.Events.StartStream<Battery>(command.BatteryId, battery.UncommittedEvents.ToArray());
        await _session.SaveChangesAsync(ct);

        return command.BatteryId;
    }
}
