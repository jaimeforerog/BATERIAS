using Baterias.Domain.ValueObjects;
using MediatR;

namespace Baterias.Application.Commands;

public record RecordMaintenanceCommand(
    Guid BatteryId,
    DateTime MaintenanceDate,
    MaintenanceType Type,
    decimal VoltageReading,
    HealthStatus HealthStatus,
    string Notes,
    string PerformedBy
) : IRequest;
