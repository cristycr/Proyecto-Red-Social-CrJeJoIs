using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

[Authorize]
[Route("ws")]
[ApiController]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketManager _manager;

    public WebSocketController(WebSocketManager manager)
    {
        _manager = manager;
    }

    [HttpGet]
    public async Task Connect()
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            HttpContext.Response.StatusCode = 400;
            return;
        }

        var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

        var userId = User.FindFirst("id")?.Value;

        if (userId is null)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        _manager.AddConnection(userId, socket);

        await Listen(socket, userId);
    }

    private async Task Listen(WebSocket socket, string userId)
    {
        var buffer = new byte[1024];

        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(
                    new ArraySegment<byte>(buffer),
                    CancellationToken.None
                );

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }
            }
        }
        finally
        {
            _manager.RemoveConnection(userId);

            if (socket.State != WebSocketState.Closed)
            {
                await socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Closed",
                    CancellationToken.None
                );
            }
        }
    }
}