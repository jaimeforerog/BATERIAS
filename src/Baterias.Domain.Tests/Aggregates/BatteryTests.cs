using Baterias.Domain.Aggregates;
using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;
using FluentAssertions;

namespace Baterias.Domain.Tests.Aggregates;

public class BatteryTests
{
    #region Register Tests

    [Fact]
    public void Register_WithValidData_ShouldCreateBatteryWithNewStatus()
    {
        // Arrange
        var batteryId = Guid.NewGuid();
        var serialNumber = "BAT-001";
        var model = "Model X";
        var brand = "BrandY";
        var registrationDate = DateTime.UtcNow;
        var registeredBy = "John Doe";

        // Act
        var battery = Battery.Register(batteryId, serialNumber, model, brand, registrationDate, registeredBy);

        // Assert
        battery.Should().NotBeNull();
        battery.Id.Should().Be(batteryId);
        battery.SerialNumber.Should().Be(serialNumber);
        battery.Model.Should().Be(model);
        battery.Brand.Should().Be(brand);
        battery.RegistrationDate.Should().Be(registrationDate);
        battery.Status.Should().Be(BatteryStatus.New);
        battery.UncommittedEvents.Should().HaveCount(1);
        battery.UncommittedEvents[0].Should().BeOfType<BatteryRegistered>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Register_WithInvalidSerialNumber_ShouldThrowArgumentException(string? invalidSerialNumber)
    {
        // Arrange & Act
        var act = () => Battery.Register(
            Guid.NewGuid(),
            invalidSerialNumber,
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*número de serie*");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Register_WithInvalidModel_ShouldThrowArgumentException(string? invalidModel)
    {
        // Arrange & Act
        var act = () => Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            invalidModel,
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*modelo*");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Register_WithInvalidBrand_ShouldThrowArgumentException(string? invalidBrand)
    {
        // Arrange & Act
        var act = () => Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            invalidBrand,
            DateTime.UtcNow,
            "John Doe"
        );

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*marca*");
    }

    #endregion

    #region Install Tests

    [Fact]
    public void Install_OnNewBattery_ShouldChangeStatusToInstalled()
    {
        // Arrange
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );
        battery.ClearUncommittedEvents();

        var equipoId = 101;
        var equipoCodigo = "EQ-101";
        var installationDate = DateTime.UtcNow;
        var initialVoltage = 12.6m;
        var installedBy = "Jane Smith";

        // Act
        battery.Install(equipoId, equipoCodigo, installationDate, initialVoltage, installedBy);

        // Assert
        battery.Status.Should().Be(BatteryStatus.Installed);
        battery.CurrentEquipoId.Should().Be(equipoId);
        battery.InstallationDate.Should().Be(installationDate);
        battery.LastVoltageReading.Should().Be(initialVoltage);
        battery.UncommittedEvents.Should().HaveCount(1);
        battery.UncommittedEvents[0].Should().BeOfType<BatteryInstalled>();
    }

    [Theory]
    [InlineData(9.9)]
    [InlineData(15.1)]
    [InlineData(5.0)]
    [InlineData(20.0)]
    public void Install_WithInvalidVoltage_ShouldThrowInvalidOperationException(decimal invalidVoltage)
    {
        // Arrange
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        // Act
        var act = () => battery.Install(
            101,
            "EQ-101",
            DateTime.UtcNow,
            invalidVoltage,
            "Jane Smith"
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Voltaje inválido*");
    }

    [Fact]
    public void Install_OnAlreadyInstalledBattery_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );
        battery.Install(101, "EQ-101", DateTime.UtcNow, 12.6m, "Jane Smith");

        // Act
        var act = () => battery.Install(
            102,
            "EQ-102",
            DateTime.UtcNow,
            12.5m,
            "Jane Smith"
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*solo se puede instalar*");
    }

    #endregion

    #region RecordMaintenance Tests

    [Fact]
    public void RecordMaintenance_OnInstalledBattery_ShouldUpdateVoltageAndHealthStatus()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.ClearUncommittedEvents();

        var maintenanceDate = DateTime.UtcNow;
        var voltageReading = 12.2m;
        var healthStatus = HealthStatus.Good;
        var notes = "Regular maintenance";
        var performedBy = "Technician";

        // Act
        battery.RecordMaintenance(
            maintenanceDate,
            MaintenanceType.Inspection,
            voltageReading,
            healthStatus,
            notes,
            performedBy
        );

        // Assert
        battery.LastVoltageReading.Should().Be(voltageReading);
        battery.CurrentHealthStatus.Should().Be(healthStatus);
        battery.MaintenanceHistory.Should().HaveCount(1);
        battery.UncommittedEvents.Should().HaveCount(1);
        battery.UncommittedEvents[0].Should().BeOfType<MaintenanceRecorded>();
    }

    [Fact]
    public void RecordMaintenance_OnNonInstalledBattery_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        // Act
        var act = () => battery.RecordMaintenance(
            DateTime.UtcNow,
            MaintenanceType.Inspection,
            12.2m,
            HealthStatus.Good,
            "Notes",
            "Technician"
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*No se puede registrar mantenimiento*");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(21)]
    [InlineData(25)]
    public void RecordMaintenance_WithInvalidVoltage_ShouldThrowArgumentException(decimal invalidVoltage)
    {
        // Arrange
        var battery = CreateInstalledBattery();

        // Act
        var act = () => battery.RecordMaintenance(
            DateTime.UtcNow,
            MaintenanceType.Inspection,
            invalidVoltage,
            HealthStatus.Good,
            "Notes",
            "Technician"
        );

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*Voltaje inválido*");
    }

    #endregion

    #region Remove Tests

    [Fact]
    public void Remove_OnInstalledBattery_ShouldChangeStatusToRemoved()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.ClearUncommittedEvents();

        // Act
        battery.Remove(BatteryRemovalReason.EndOfLife, "Needs replacement", "Technician");

        // Assert
        battery.Status.Should().Be(BatteryStatus.Removed);
        battery.CurrentEquipoId.Should().BeNull();
        battery.UncommittedEvents.Should().HaveCount(1);
        battery.UncommittedEvents[0].Should().BeOfType<BatteryRemoved>();
    }

    [Fact]
    public void Remove_OnNonInstalledBattery_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        // Act
        var act = () => battery.Remove(BatteryRemovalReason.EndOfLife, "Notes", "Technician");

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*No se puede remover*");
    }

    #endregion

    #region Replace Tests

    [Fact]
    public void Replace_OnInstalledBattery_ShouldChangeStatusToRemoved()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.ClearUncommittedEvents();
        var newBatteryId = Guid.NewGuid();

        // Act
        battery.Replace(newBatteryId, BatteryRemovalReason.Upgrade, "Technician");

        // Assert
        battery.Status.Should().Be(BatteryStatus.Removed);
        battery.CurrentEquipoId.Should().BeNull();
        battery.UncommittedEvents.Should().HaveCount(1);

        var replacedEvent = battery.UncommittedEvents[0] as BatteryReplaced;
        replacedEvent.Should().NotBeNull();
        replacedEvent!.OldBatteryId.Should().Be(battery.Id);
        replacedEvent.NewBatteryId.Should().Be(newBatteryId);
    }

    #endregion

    #region Dispose Tests

    [Fact]
    public void Dispose_OnRemovedBattery_ShouldChangeStatusToDisposed()
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.Remove(BatteryRemovalReason.EndOfLife, "Old battery", "Technician");
        battery.ClearUncommittedEvents();

        // Act
        battery.Dispose(
            DateTime.UtcNow,
            "End of life",
            "Recycled properly",
            "Technician"
        );

        // Assert
        battery.Status.Should().Be(BatteryStatus.Disposed);
        battery.UncommittedEvents.Should().HaveCount(1);
        battery.UncommittedEvents[0].Should().BeOfType<BatteryDisposed>();
    }

    [Fact]
    public void Dispose_OnNonRemovedBattery_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var battery = CreateInstalledBattery();

        // Act
        var act = () => battery.Dispose(
            DateTime.UtcNow,
            "End of life",
            "Notes",
            "Technician"
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*No se puede desechar*");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Dispose_WithInvalidDisposalReason_ShouldThrowArgumentException(string? invalidReason)
    {
        // Arrange
        var battery = CreateInstalledBattery();
        battery.Remove(BatteryRemovalReason.EndOfLife, "Notes", "Technician");

        // Act
        var act = () => battery.Dispose(
            DateTime.UtcNow,
            invalidReason,
            "Notes",
            "Technician"
        );

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*Razón de desecho*");
    }

    #endregion

    #region Helper Methods

    private static Battery CreateInstalledBattery()
    {
        var battery = Battery.Register(
            Guid.NewGuid(),
            "BAT-001",
            "Model X",
            "BrandY",
            DateTime.UtcNow,
            "John Doe"
        );

        battery.Install(101, "EQ-101", DateTime.UtcNow, 12.6m, "Jane Smith");

        return battery;
    }

    #endregion
}
