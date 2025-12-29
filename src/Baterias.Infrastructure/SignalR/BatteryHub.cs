using Microsoft.AspNetCore.SignalR;

namespace Baterias.Infrastructure.SignalR;

/// <summary>
/// Hub de SignalR para transmitir actualizaciones de baterías en tiempo real
/// </summary>
public class BatteryHub : Hub
{
    private const string BatteryUpdatesGroup = "BatteryUpdates";

    /// <summary>
    /// Se llama cuando un cliente se conecta al hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        // Agregar el cliente al grupo de actualizaciones de baterías
        await Groups.AddToGroupAsync(Context.ConnectionId, BatteryUpdatesGroup);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Se llama cuando un cliente se desconecta del hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, BatteryUpdatesGroup);
        await base.OnDisconnectedAsync(exception);
    }
}
