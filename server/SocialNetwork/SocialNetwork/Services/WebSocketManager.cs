using System.Net.WebSockets;
using System.Collections.Concurrent;

public class WebSocketManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();

    public void AddConnection(string userId, WebSocket socket)
    {
        _connections[userId] = socket;
    }

    public async Task SendMessage(string userId, string message)
    {
        if (_connections.TryGetValue(userId, out var socket))
        {
            if (socket.State == WebSocketState.Open)
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(message);

                await socket.SendAsync(
                    bytes,
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
        }
    }

    public void RemoveConnection(string userId)
    {
        _connections.TryRemove(userId, out _);
    }
}