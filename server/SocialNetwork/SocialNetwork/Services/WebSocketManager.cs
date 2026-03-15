using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

public class WebSocketManager
{
    private readonly ConcurrentDictionary<string, List<WebSocket>> _connections = new();

    public void AddConnection(string userId, WebSocket socket)
    {
        var sockets = _connections.GetOrAdd(userId, _ => new List<WebSocket>());

        lock (sockets)
        {
            sockets.Add(socket);
        }
    }

    public async Task SendMessage(string userId, string message)
    {
        if (!_connections.TryGetValue(userId, out var sockets))
            return;

        var bytes = Encoding.UTF8.GetBytes(message);

        List<WebSocket> closedSockets = new();

        foreach (var socket in sockets)
        {
            if (socket.State == WebSocketState.Open)
            {
                await socket.SendAsync(
                    bytes,
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
            else
            {
                closedSockets.Add(socket);
            }
        }

        lock (sockets)
        {
            foreach (var closed in closedSockets)
            {
                sockets.Remove(closed);
            }
        }
    }

    public void RemoveConnection(string userId)
    {
        _connections.TryRemove(userId, out _);
    }
}