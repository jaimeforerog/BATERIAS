using Baterias.Application.Handlers;
using Baterias.Application.Commands;
using Baterias.Application.Projections;
using Baterias.Domain.Aggregates;
using Baterias.Domain.Events;
using Baterias.Domain.ValueObjects;
using Marten;

namespace Baterias.Tests.Integration;

public class MartenIntegrationTests : IAsyncLifetime
{
    private IDocumentStore? _store;
    private const string ConnectionString = "Host=localhost;Port=5432;Database=battery_test;Username=postgres;Password=postgres";

    public async Task InitializeAsync()
    {
        _store = DocumentStore.For(options =>
        {
            options.Connection(ConnectionString);
        });

        // Clean database before tests
        await _store.Advanced.Clean.DeleteAllDocumentsAsync();
        await _store.Advanced.Clean.DeleteAllEventDataAsync();
    }

    public async Task DisposeAsync()
    {
        if (_store != null)
        {
            await _store.DisposeAsync();
        }
    }

    [Fact]
    public async Task EventStore_CanStoreAndRetrieveBatteryEvents()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var batteryId = Guid.NewGuid();
        var equipoId = 1;

        var installEvent = new BatteryInstalled(
            batteryId,
            "BAT-001",
            "PowerMax 3000",
            equipoId,
            "EQ-001",
            DateTime.UtcNow,
            12.5m,
            "Juan Pérez"
        );

        // Act
        session.Events.StartStream<Battery>(batteryId, installEvent);
        await session.SaveChangesAsync();

        // Assert
        var events = await session.Events.FetchStreamAsync(batteryId);
        Assert.Single(events);
        Assert.IsType<BatteryInstalled>(events.First().Data);
    }

    [Fact]
    public async Task Aggregate_CanBeReconstructedFromEvents()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var batteryId = Guid.NewGuid();
        var equipoId = 2;
        var installDate = DateTime.UtcNow;

        // Create event stream
        var installEvent = new BatteryInstalled(
            batteryId,
            "BAT-002",
            "PowerMax 4000",
            equipoId,
            "EQ-002",
            installDate,
            12.8m,
            "María González"
        );

        var maintenanceEvent = new MaintenanceRecorded(
            batteryId,
            Guid.NewGuid(),
            installDate.AddDays(7),  // Maintenance date
            DateTime.UtcNow,          // Recorded at
            MaintenanceType.Charging,
            13.2m,
            HealthStatus.Good,
            "Weekly maintenance",
            "Tech Team"
        );

        session.Events.StartStream<Battery>(batteryId, installEvent, maintenanceEvent);
        await session.SaveChangesAsync();

        // Act
        var battery = await session.Events.AggregateStreamAsync<Battery>(batteryId);

        // Assert
        Assert.NotNull(battery);
        Assert.Equal(batteryId, battery.Id);
        Assert.Equal("BAT-002", battery.SerialNumber);
        Assert.Equal(BatteryStatus.Installed, battery.Status);
        Assert.Equal(13.2m, battery.LastVoltageReading);
        Assert.Equal(HealthStatus.Good, battery.CurrentHealthStatus);
        Assert.Single(battery.MaintenanceHistory);
    }

    [Fact]
    public async Task CommandHandler_InstallBattery_CreatesEventStream()
    {
        // Arrange
        await using var session = _store!.LightweightSession();

        // First register the battery
        var batteryId = Guid.NewGuid();
        var registerCommand = new RegisterBatteryCommand(
            batteryId,
            "BAT-100",
            "TestModel",
            "TestBrand",
            DateTime.UtcNow,
            "Setup"
        );
        var registerHandler = new RegisterBatteryHandler(session);
        await registerHandler.Handle(registerCommand, CancellationToken.None);

        // Then install it
        await using var session2 = _store!.LightweightSession();
        var installCommand = new InstallBatteryCommand(
            batteryId,
            "BAT-100",
            "TestModel",
            1,
            "EQ-100",
            DateTime.UtcNow,
            12.5m,
            "Handler Test"
        );
        var installHandler = new InstallBatteryHandler(session2);

        // Act
        await installHandler.Handle(installCommand, CancellationToken.None);

        // Assert
        var battery = await session2.Events.AggregateStreamAsync<Battery>(batteryId);
        Assert.NotNull(battery);
        Assert.Equal("BAT-100", battery.SerialNumber);
        Assert.Equal(BatteryStatus.Installed, battery.Status);
    }

    [Fact]
    public async Task CommandHandler_RecordMaintenance_AppendsToStream()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var batteryId = Guid.NewGuid();

        // Register battery first
        var registerCommand = new RegisterBatteryCommand(
            batteryId,
            "BAT-200",
            "TestModel",
            "TestBrand",
            DateTime.UtcNow,
            "Setup"
        );
        var registerHandler = new RegisterBatteryHandler(session);
        await registerHandler.Handle(registerCommand, CancellationToken.None);

        // Install battery
        await using var session2 = _store!.LightweightSession();
        var installCommand = new InstallBatteryCommand(
            batteryId,
            "BAT-200",
            "TestModel",
            2,
            "EQ-200",
            DateTime.UtcNow,
            12.5m,
            "Setup"
        );
        var installHandler = new InstallBatteryHandler(session2);
        await installHandler.Handle(installCommand, CancellationToken.None);

        // Create new session for maintenance
        await using var session3 = _store!.LightweightSession();
        var maintenanceCommand = new RecordMaintenanceCommand(
            batteryId,
            DateTime.UtcNow,
            MaintenanceType.VoltageTest,
            13.5m,
            HealthStatus.Excellent,
            "Test maintenance",
            "Tester"
        );
        var maintenanceHandler = new RecordMaintenanceHandler(session3);

        // Act
        await maintenanceHandler.Handle(maintenanceCommand, CancellationToken.None);

        // Assert
        var events = await session3.Events.FetchStreamAsync(batteryId);
        Assert.Equal(3, events.Count); // BatteryRegistered, BatteryInstalled, MaintenanceRecorded
        Assert.IsType<BatteryRegistered>(events[0].Data);
        Assert.IsType<BatteryInstalled>(events[1].Data);
        Assert.IsType<MaintenanceRecorded>(events[2].Data);

        var battery = await session3.Events.AggregateStreamAsync<Battery>(batteryId);
        Assert.Equal(13.5m, battery!.LastVoltageReading);
        Assert.Equal(HealthStatus.Excellent, battery.CurrentHealthStatus);
    }

    [Fact]
    public async Task CommandHandler_ReplaceBattery_UpdatesBothBatteries()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var equipoId = 3;
        var oldBatteryId = Guid.NewGuid();

        // Register and install first battery
        var registerCommand = new RegisterBatteryCommand(
            oldBatteryId,
            "BAT-OLD",
            "OldModel",
            "OldBrand",
            DateTime.UtcNow,
            "Setup"
        );
        var registerHandler = new RegisterBatteryHandler(session);
        await registerHandler.Handle(registerCommand, CancellationToken.None);

        await using var session2 = _store!.LightweightSession();
        var installCommand = new InstallBatteryCommand(
            oldBatteryId,
            "BAT-OLD",
            "OldModel",
            equipoId,
            "EQ-OLD",
            DateTime.UtcNow,
            12.5m,
            "Installer"
        );
        var installHandler = new InstallBatteryHandler(session2);
        await installHandler.Handle(installCommand, CancellationToken.None);

        // Register the new battery
        await using var session3 = _store!.LightweightSession();
        var newBatteryId = Guid.NewGuid();
        var registerNewCommand = new RegisterBatteryCommand(
            newBatteryId,
            "BAT-NEW",
            "NewModel",
            "NewBrand",
            DateTime.UtcNow,
            "Setup"
        );
        var registerNewHandler = new RegisterBatteryHandler(session3);
        await registerNewHandler.Handle(registerNewCommand, CancellationToken.None);

        // Create new session for replacement
        await using var session4 = _store!.LightweightSession();
        var replaceCommand = new ReplaceBatteryCommand(
            oldBatteryId,
            newBatteryId,
            "BAT-NEW",
            "NewModel",
            equipoId,
            "EQ-NEW",
            BatteryRemovalReason.Upgrade,
            12.8m,
            "Replacer"
        );
        var replaceHandler = new ReplaceBatteryHandler(session4);

        // Act
        await replaceHandler.Handle(replaceCommand, CancellationToken.None);

        // Assert
        // Check old battery is removed
        var oldBattery = await session4.Events.AggregateStreamAsync<Battery>(oldBatteryId);
        Assert.Equal(BatteryStatus.Removed, oldBattery!.Status);
        Assert.Null(oldBattery.CurrentEquipoId);

        // Check new battery is installed
        var newBattery = await session4.Events.AggregateStreamAsync<Battery>(newBatteryId);
        Assert.Equal(BatteryStatus.Installed, newBattery!.Status);
        Assert.Equal(equipoId, newBattery.CurrentEquipoId);
    }

    [Fact]
    public async Task MultipleOperations_EventStreamMaintainsOrder()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var batteryId = Guid.NewGuid();
        var equipoId = 1;
        var installDate = DateTime.UtcNow;

        var battery = Battery.Install(
            batteryId,
            "BAT-MULTI",
            "MultiTest 3000",
            equipoId,
            "EQ-MULTI",
            installDate,
            12.5m,
            "Tech"
        );

        session.Events.StartStream<Battery>(batteryId, battery.UncommittedEvents.ToArray());
        await session.SaveChangesAsync();

        // New session for maintenance
        await using var session2 = _store!.LightweightSession();
        var battery2 = await session2.Events.AggregateStreamAsync<Battery>(batteryId);
        battery2!.ClearUncommittedEvents();

        battery2.RecordMaintenance(
            DateTime.UtcNow,
            MaintenanceType.Charging,
            13.0m,
            HealthStatus.Good,
            "Charge 1",
            "Tech1"
        );

        battery2.RecordMaintenance(
            DateTime.UtcNow,
            MaintenanceType.Inspection,
            13.2m,
            HealthStatus.Excellent,
            "Inspection 1",
            "Tech2"
        );

        session2.Events.Append(batteryId, battery2.UncommittedEvents.ToArray());
        await session2.SaveChangesAsync();

        // Act
        await using var session3 = _store!.LightweightSession();
        var events = await session3.Events.FetchStreamAsync(batteryId);
        var reconstructedBattery = await session3.Events.AggregateStreamAsync<Battery>(batteryId);

        // Assert
        Assert.Equal(3, events.Count);
        Assert.IsType<BatteryInstalled>(events[0].Data);
        Assert.IsType<MaintenanceRecorded>(events[1].Data);
        Assert.IsType<MaintenanceRecorded>(events[2].Data);

        Assert.Equal(13.2m, reconstructedBattery!.LastVoltageReading);
        Assert.Equal(HealthStatus.Excellent, reconstructedBattery.CurrentHealthStatus);
        Assert.Equal(2, reconstructedBattery.MaintenanceHistory.Count);
    }

    [Fact]
    public async Task EventStream_HandlesCompleteLifecycle()
    {
        // Arrange
        await using var session = _store!.LightweightSession();
        var batteryId = Guid.NewGuid();
        var equipoId = 2;

        // Install
        var battery = Battery.Install(
            batteryId,
            "BAT-LIFECYCLE",
            "Lifecycle Test",
            equipoId,
            "EQ-LIFE",
            DateTime.UtcNow,
            12.6m,
            "Installer"
        );

        session.Events.StartStream<Battery>(batteryId, battery.UncommittedEvents.ToArray());
        await session.SaveChangesAsync();

        // Maintenance 1
        await using var session2 = _store!.LightweightSession();
        var battery2 = await session2.Events.AggregateStreamAsync<Battery>(batteryId);
        battery2!.ClearUncommittedEvents();
        battery2.RecordMaintenance(DateTime.UtcNow, MaintenanceType.Charging, 13.1m, HealthStatus.Good, "Charge", "Tech");
        session2.Events.Append(batteryId, battery2.UncommittedEvents.ToArray());
        await session2.SaveChangesAsync();

        // Maintenance 2
        await using var session3 = _store!.LightweightSession();
        var battery3 = await session3.Events.AggregateStreamAsync<Battery>(batteryId);
        battery3!.ClearUncommittedEvents();
        battery3.RecordMaintenance(DateTime.UtcNow, MaintenanceType.VoltageTest, 12.9m, HealthStatus.Fair, "Test", "Tech");
        session3.Events.Append(batteryId, battery3.UncommittedEvents.ToArray());
        await session3.SaveChangesAsync();

        // Replace
        await using var session4 = _store!.LightweightSession();
        var battery4 = await session4.Events.AggregateStreamAsync<Battery>(batteryId);
        battery4!.ClearUncommittedEvents();
        battery4.Replace(Guid.NewGuid(), BatteryRemovalReason.EndOfLife, "Replacer");
        session4.Events.Append(batteryId, battery4.UncommittedEvents.ToArray());
        await session4.SaveChangesAsync();

        // Act - Load final state
        await using var sessionFinal = _store!.LightweightSession();
        var events = await sessionFinal.Events.FetchStreamAsync(batteryId);
        var finalBattery = await sessionFinal.Events.AggregateStreamAsync<Battery>(batteryId);

        // Assert
        Assert.Equal(4, events.Count);
        Assert.IsType<BatteryInstalled>(events[0].Data);
        Assert.IsType<MaintenanceRecorded>(events[1].Data);
        Assert.IsType<MaintenanceRecorded>(events[2].Data);
        Assert.IsType<BatteryReplaced>(events[3].Data);

        Assert.Equal(BatteryStatus.Removed, finalBattery!.Status);
        Assert.Null(finalBattery.CurrentEquipoId);
        Assert.Equal(2, finalBattery.MaintenanceHistory.Count);
    }
}
