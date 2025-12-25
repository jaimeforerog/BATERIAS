using Baterias.Domain.Aggregates;
using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;

namespace Baterias.Tests.Unit;

public class BatteryAggregateTests
{
    [Fact]
    public void Install_WithValidData_CreatesNewBattery()
    {
        // Arrange
        var batteryId = Guid.NewGuid();
        var serialNumber = "BAT-001";
        var model = "PowerMax 3000";
        var equipoId = 1;
        var equipoCodigo = "EQ-001";
        var initialVoltage = 12.5m;
        var installedBy = "Juan Pérez";

        // Act
        var battery = Battery.Install(
            batteryId,
            serialNumber,
            model,
            equipoId,
            equipoCodigo,
            initialVoltage,
            installedBy
        );

        // Assert
        Assert.NotNull(battery);
        Assert.Equal(batteryId, battery.Id);
        Assert.Equal(serialNumber, battery.SerialNumber);
        Assert.Equal(model, battery.Model);
        Assert.Equal(BatteryStatus.Installed, battery.Status);
        Assert.Equal(equipoId, battery.CurrentEquipoId);
        Assert.Equal(initialVoltage, battery.LastVoltageReading);
        Assert.Single(battery.UncommittedEvents);

        var @event = battery.UncommittedEvents.First() as BatteryInstalled;
        Assert.NotNull(@event);
        Assert.Equal(batteryId, @event.BatteryId);
        Assert.Equal(serialNumber, @event.BatterySerialNumber);
    }

    [Theory]
    [InlineData(9.9)]   // Below minimum
    [InlineData(15.1)]  // Above maximum
    [InlineData(0)]     // Zero
    [InlineData(-1)]    // Negative
    public void Install_WithInvalidVoltage_ThrowsException(decimal invalidVoltage)
    {
        // Arrange
        var batteryId = Guid.NewGuid();
        var equipoId = 1;

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            Battery.Install(
                batteryId,
                "BAT-001",
                "PowerMax 3000",
                equipoId,
                "EQ-001",
                invalidVoltage,
                "Juan Pérez"
            )
        );

        Assert.Contains("voltage", exception.Message.ToLower());
    }

    [Fact]
    public void RecordMaintenance_WhenInstalled_UpdatesBatteryState()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.ClearUncommittedEvents();

        var maintenanceType = MaintenanceType.Charging;
        var voltageReading = 13.2m;
        var healthStatus = HealthStatus.Good;
        var notes = "Carga completa";
        var performedBy = "María González";

        // Act
        battery.RecordMaintenance(
            maintenanceType,
            voltageReading,
            healthStatus,
            notes,
            performedBy
        );

        // Assert
        Assert.Equal(voltageReading, battery.LastVoltageReading);
        Assert.Equal(healthStatus, battery.CurrentHealthStatus);
        Assert.Single(battery.UncommittedEvents);

        var @event = battery.UncommittedEvents.First() as MaintenanceRecorded;
        Assert.NotNull(@event);
        Assert.Equal(battery.Id, @event.BatteryId);
        Assert.Equal(maintenanceType, @event.Type);
        Assert.Equal(voltageReading, @event.VoltageReading);
    }

    [Fact]
    public void RecordMaintenance_WhenNotInstalled_ThrowsInvalidOperationException()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.Replace(Guid.NewGuid(), BatteryRemovalReason.EndOfLife, "Technician");
        battery.ClearUncommittedEvents();

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            battery.RecordMaintenance(
                MaintenanceType.Charging,
                12.5m,
                HealthStatus.Good,
                "Test",
                "Test User"
            )
        );

        Assert.Contains("installed", exception.Message.ToLower());
    }

    [Fact]
    public void Replace_WhenInstalled_ChangesBatteryStatus()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        var originalEquipoId = battery.CurrentEquipoId;
        battery.ClearUncommittedEvents();

        var newBatteryId = Guid.NewGuid();
        var reason = BatteryRemovalReason.EndOfLife;
        var replacedBy = "Technician";

        // Act
        battery.Replace(newBatteryId, reason, replacedBy);

        // Assert
        Assert.Equal(BatteryStatus.Removed, battery.Status);
        Assert.Null(battery.CurrentEquipoId);
        Assert.Single(battery.UncommittedEvents);

        var @event = battery.UncommittedEvents.First() as BatteryReplaced;
        Assert.NotNull(@event);
        Assert.Equal(battery.Id, @event.OldBatteryId);
        Assert.Equal(newBatteryId, @event.NewBatteryId);
        Assert.Equal(originalEquipoId, @event.EquipoId);
    }

    [Fact]
    public void Replace_WhenNotInstalled_ThrowsInvalidOperationException()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.Replace(Guid.NewGuid(), BatteryRemovalReason.EndOfLife, "Tech");
        battery.ClearUncommittedEvents();

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            battery.Replace(Guid.NewGuid(), BatteryRemovalReason.EndOfLife, "Tech2")
        );

        Assert.Contains("installed", exception.Message.ToLower());
    }

    [Fact]
    public void Apply_BatteryInstalled_UpdatesState()
    {
        // Arrange
        var battery = new Battery();
        var @event = new BatteryInstalled(
            Guid.NewGuid(),
            "BAT-001",
            "PowerMax 3000",
            1,
            "EQ-001",
            DateTime.UtcNow,
            12.5m,
            "Juan Pérez"
        );

        // Act
        battery.Apply(@event);

        // Assert
        Assert.Equal(@event.BatteryId, battery.Id);
        Assert.Equal(@event.BatterySerialNumber, battery.SerialNumber);
        Assert.Equal(@event.BatteryModel, battery.Model);
        Assert.Equal(BatteryStatus.Installed, battery.Status);
        Assert.Equal(@event.EquipoId, battery.CurrentEquipoId);
        Assert.Equal(@event.InitialVoltage, battery.LastVoltageReading);
    }

    [Fact]
    public void Apply_MaintenanceRecorded_UpdatesVoltageAndHealth()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        var maintenanceId = Guid.NewGuid();
        var @event = new MaintenanceRecorded(
            battery.Id,
            maintenanceId,
            DateTime.UtcNow,
            MaintenanceType.VoltageTest,
            13.8m,
            HealthStatus.Excellent,
            "Perfect condition",
            "Tech"
        );

        // Act
        battery.Apply(@event);

        // Assert
        Assert.Equal(13.8m, battery.LastVoltageReading);
        Assert.Equal(HealthStatus.Excellent, battery.CurrentHealthStatus);
        Assert.Contains(maintenanceId, battery.MaintenanceHistory);
    }

    [Fact]
    public void Apply_BatteryReplaced_ChangeStatusToRemoved()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        var currentEquipoId = battery.CurrentEquipoId;
        var @event = new BatteryReplaced(
            battery.Id,
            Guid.NewGuid(),
            currentEquipoId!.Value,
            DateTime.UtcNow,
            BatteryRemovalReason.EndOfLife,
            10.5m,
            "Technician"
        );

        // Act
        battery.Apply(@event);

        // Assert
        Assert.Equal(BatteryStatus.Removed, battery.Status);
        Assert.Null(battery.CurrentEquipoId);
        Assert.Equal(10.5m, battery.LastVoltageReading);
    }

    [Fact]
    public void MaintenanceHistory_TracksMaintenance()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.ClearUncommittedEvents();

        // Act
        battery.RecordMaintenance(
            MaintenanceType.Charging,
            13.0m,
            HealthStatus.Good,
            "First maintenance",
            "Tech1"
        );

        battery.RecordMaintenance(
            MaintenanceType.Inspection,
            13.2m,
            HealthStatus.Good,
            "Second maintenance",
            "Tech2"
        );

        // Assert
        Assert.Equal(2, battery.MaintenanceHistory.Count);
    }

    [Fact]
    public void ClearUncommittedEvents_RemovesAllEvents()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        Assert.Single(battery.UncommittedEvents);

        // Act
        battery.ClearUncommittedEvents();

        // Assert
        Assert.Empty(battery.UncommittedEvents);
    }

    // Helper methods
    private Battery CreateInstalledBattery()
    {
        return Battery.Install(
            Guid.NewGuid(),
            "BAT-001",
            "PowerMax 3000",
            1,
            "EQ-001",
            12.5m,
            "Juan Pérez"
        );
    }
}
