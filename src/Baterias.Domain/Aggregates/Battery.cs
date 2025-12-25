using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;

namespace Baterias.Domain.Aggregates;

public class Battery
{
    private readonly List<object> _uncommittedEvents = new();

    public Guid Id { get; private set; }
    public string SerialNumber { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public string Brand { get; private set; } = string.Empty;
    public DateTime RegistrationDate { get; private set; }
    public BatteryStatus Status { get; private set; }
    public int? CurrentEquipoId { get; private set; }
    public DateTime? InstallationDate { get; private set; }
    public decimal? LastVoltageReading { get; private set; }
    public HealthStatus? CurrentHealthStatus { get; private set; }
    public List<Guid> MaintenanceHistory { get; private set; } = new();

    public IReadOnlyList<object> UncommittedEvents => _uncommittedEvents.AsReadOnly();

    public void ClearUncommittedEvents()
    {
        _uncommittedEvents.Clear();
    }

    // For Marten event sourcing reconstruction
    public void Apply(BatteryRegistered @event)
    {
        Id = @event.BatteryId;
        SerialNumber = @event.SerialNumber;
        Model = @event.Model;
        Brand = @event.Brand;
        RegistrationDate = @event.RegistrationDate;
        Status = BatteryStatus.New;
    }

    public void Apply(BatteryInstalled @event)
    {
        Id = @event.BatteryId;
        SerialNumber = @event.BatterySerialNumber;
        Model = @event.BatteryModel;
        CurrentEquipoId = @event.EquipoId;
        InstallationDate = @event.InstallationDate;
        LastVoltageReading = @event.InitialVoltage;
        Status = BatteryStatus.Installed;
    }

    public void Apply(MaintenanceRecorded @event)
    {
        LastVoltageReading = @event.VoltageReading;
        CurrentHealthStatus = @event.HealthStatus;
        MaintenanceHistory.Add(@event.MaintenanceId);
    }

    public void Apply(BatteryReplaced @event)
    {
        Status = BatteryStatus.Removed;
        CurrentEquipoId = null;
        LastVoltageReading = @event.FinalVoltage;
    }

    public void Apply(BatteryRemoved @event)
    {
        Status = BatteryStatus.Removed;
        CurrentEquipoId = null;
        LastVoltageReading = @event.FinalVoltage;
    }

    public void Apply(BatteryDisposed @event)
    {
        Status = BatteryStatus.Disposed;
    }

    // Business logic methods
    public static Battery Register(
        Guid batteryId,
        string serialNumber,
        string model,
        string brand,
        DateTime registrationDate,
        string registeredBy)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(serialNumber))
            throw new ArgumentException("El número de serie es requerido", nameof(serialNumber));

        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("El modelo es requerido", nameof(model));

        if (string.IsNullOrWhiteSpace(brand))
            throw new ArgumentException("La marca es requerida", nameof(brand));

        if (string.IsNullOrWhiteSpace(registeredBy))
            throw new ArgumentException("El nombre de quien registra es requerido", nameof(registeredBy));

        var battery = new Battery();
        battery.RaiseEvent(new BatteryRegistered(
            batteryId,
            serialNumber,
            model,
            brand,
            registrationDate,
            registeredBy
        ));

        return battery;
    }

    public void Install(
        int equipoId,
        string equipoCodigo,
        decimal initialVoltage,
        string installedBy)
    {
        if (Status != BatteryStatus.New)
            throw new InvalidOperationException($"La batería solo se puede instalar si ha sido registrada previamente y está en estado Nueva. Estado actual: {Status}");

        if (initialVoltage < 10 || initialVoltage > 15)
            throw new InvalidOperationException("Voltaje inválido. El voltaje inicial debe estar entre 10V y 15V");

        if (string.IsNullOrWhiteSpace(installedBy))
            throw new ArgumentException("El nombre del instalador es requerido", nameof(installedBy));

        RaiseEvent(new BatteryInstalled(
            Id,
            SerialNumber,
            Model,
            equipoId,
            equipoCodigo,
            DateTime.UtcNow,
            initialVoltage,
            installedBy
        ));
    }

    public void RecordMaintenance(
        MaintenanceType type,
        decimal voltageReading,
        HealthStatus healthStatus,
        string notes,
        string performedBy)
    {
        if (Status != BatteryStatus.Installed)
            throw new InvalidOperationException(
                $"No se puede registrar mantenimiento para esta batería porque su estado actual es '{Status}'. " +
                "Solo se puede registrar mantenimiento para baterías que estén instaladas en un equipo.");

        if (voltageReading < 0 || voltageReading > 20)
            throw new ArgumentException("Voltaje inválido. El voltaje debe estar entre 0V y 20V", nameof(voltageReading));

        if (string.IsNullOrWhiteSpace(performedBy))
            throw new ArgumentException("El campo 'Realizado por' es requerido", nameof(performedBy));

        RaiseEvent(new MaintenanceRecorded(
            Id,
            Guid.NewGuid(),
            DateTime.UtcNow,
            type,
            voltageReading,
            healthStatus,
            notes ?? string.Empty,
            performedBy
        ));
    }

    public void Remove(
        BatteryRemovalReason reason,
        string notes,
        string removedBy)
    {
        if (Status != BatteryStatus.Installed)
            throw new InvalidOperationException(
                $"No se puede remover esta batería porque su estado actual es '{Status}'. " +
                "Solo se pueden remover baterías que estén instaladas en un equipo. " +
                "Por favor, selecciona una batería del panel 'Instaladas'.");

        if (string.IsNullOrWhiteSpace(removedBy))
            throw new ArgumentException("El campo 'Removido por' es requerido", nameof(removedBy));

        RaiseEvent(new BatteryRemoved(
            Id,
            CurrentEquipoId!.Value,
            DateTime.UtcNow,
            reason,
            LastVoltageReading ?? 0,
            notes ?? string.Empty,
            removedBy
        ));
    }

    public void Replace(
        Guid newBatteryId,
        BatteryRemovalReason reason,
        string replacedBy)
    {
        if (Status != BatteryStatus.Installed)
            throw new InvalidOperationException(
                $"No se puede reemplazar esta batería porque su estado actual es '{Status}'. " +
                "Solo se pueden reemplazar baterías que estén instaladas en un equipo. " +
                "Por favor, selecciona una batería del panel 'Instaladas'.");

        if (string.IsNullOrWhiteSpace(replacedBy))
            throw new ArgumentException("El campo 'Reemplazado por' es requerido", nameof(replacedBy));

        RaiseEvent(new BatteryReplaced(
            Id,
            newBatteryId,
            CurrentEquipoId!.Value,
            DateTime.UtcNow,
            reason,
            LastVoltageReading ?? 0,
            replacedBy
        ));
    }

    public void Dispose(
        DateTime disposalDate,
        string disposalReason,
        string notes,
        string disposedBy)
    {
        if (Status != BatteryStatus.Removed)
            throw new InvalidOperationException(
                $"No se puede desechar esta batería porque su estado actual es '{Status}'. " +
                "Solo se pueden desechar baterías que hayan sido removidas previamente. " +
                "Por favor, primero remueve la batería del equipo antes de desecharla, " +
                "o selecciona una batería del panel 'Removidas'.");

        if (string.IsNullOrWhiteSpace(disposalReason))
            throw new ArgumentException("El campo 'Razón de desecho' es requerido", nameof(disposalReason));

        if (string.IsNullOrWhiteSpace(disposedBy))
            throw new ArgumentException("El campo 'Desechado por' es requerido", nameof(disposedBy));

        RaiseEvent(new BatteryDisposed(
            Id,
            disposalDate,
            disposalReason,
            notes ?? string.Empty,
            disposedBy
        ));
    }

    private void RaiseEvent(object @event)
    {
        _uncommittedEvents.Add(@event);
        ((dynamic)this).Apply((dynamic)@event);
    }
}
