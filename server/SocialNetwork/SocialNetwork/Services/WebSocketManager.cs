using System.Net.WebSockets;
using System.Text;

public class WebSocketManager
{
    // Un solo socket por usuario
    private readonly Dictionary<string, WebSocket> _sockets = new();

    // Añade una conexión para un usuario. Si ya existía, cierra el socket anterior antes de reemplazarlo.
    public void AddConnection(string userId, WebSocket socket)
    {
        lock (_sockets)
        {
            if (_sockets.TryGetValue(userId, out var existingSocket))
            {
                if (existingSocket.State == WebSocketState.Open)
                {
                    // Cerramos la conexión anterior para evitar duplicados
                    existingSocket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Duplicated connection",
                        CancellationToken.None
                    ).Wait();
                }
                _sockets.Remove(userId);
            }

            _sockets[userId] = socket;
        }
    }

    // Elimina la conexión de un usuario
    public void RemoveConnection(string userId)
    {
        lock (_sockets)
        {
            if (_sockets.TryGetValue(userId, out var socket))
            {
                if (socket.State == WebSocketState.Open)
                {
                    socket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "User disconnected",
                        CancellationToken.None
                    ).Wait();
                }
                _sockets.Remove(userId);
            }
        }
    }

    // Envía un mensaje a un usuario específico (si está conectado)
    public async Task SendMessage(string userId, string message)
    {
        WebSocket? socket;
        lock (_sockets)
        {
            _sockets.TryGetValue(userId, out socket);
        }

        if (socket != null && socket.State == WebSocketState.Open)
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }

    // Cierra y limpia todas las conexiones (opcional para logout global)
    public void RemoveAllConnections()
    {
        lock (_sockets)
        {
            foreach (var socket in _sockets.Values)
            {
                if (socket.State == WebSocketState.Open)
                {
                    socket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Server shutdown",
                        CancellationToken.None
                    ).Wait();
                }
            }
            _sockets.Clear();
        }
    }
}