using System.Net.WebSockets;
using System.Text;

public class WebSocketManager
{
    private readonly Dictionary<string, WebSocket> _sockets = new();

    // Añade una conexión para un usuario. Si ya existía, cierra el socket anterior antes de reemplazarlo.
    public async Task AddConnection(string userId, WebSocket socket)
    {
        WebSocket? existingSocket = null;

        lock (_sockets)
        {
            if (_sockets.TryGetValue(userId, out existingSocket))
            {
                _sockets.Remove(userId);
            }

            _sockets[userId] = socket;
        }

        if (existingSocket != null && existingSocket.State == WebSocketState.Open)
        {
            // Cerramos la conexión anterior para evitar duplicados
            try
            {
                await existingSocket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Duplicated connection",
                    CancellationToken.None
                );
            }
            catch
            {

            }
        }
    }

    // Elimina la conexión de un usuario
    public async Task RemoveConnection(string userId)
    {
        WebSocket? socket = null;

        lock (_sockets)
        {
            if (_sockets.TryGetValue(userId, out socket))
            {
                _sockets.Remove(userId);
            }
        }

        if (socket != null && socket.State == WebSocketState.Open)
        {
            await socket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "User disconnected",
                CancellationToken.None
            );
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

            try
            {
                await socket.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
            catch
            {
                _ = RemoveConnection(userId);
            }
        }
    }

    // Cierra y limpia todas las conexiones (opcional para logout global)
    public async Task RemoveAllConnections()
    {
        List<WebSocket> sockets;

        lock (_sockets)
        {
            sockets = _sockets.Values.ToList();
            _sockets.Clear();
        }

        foreach (var socket in sockets)
        {
            try
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Server shutdown",
                        CancellationToken.None
                    );
                }
            }
            catch
            {

            }
        }
    }
}