using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Services;
using SocialNetwork.Services.Auth;
using Swashbuckle.AspNetCore.Filters;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;

namespace SocialNetwork;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Controladores
        builder.Services.AddControllers();

        // Repositorios
        builder.Services.AddScoped<PostRepository>();
        builder.Services.AddScoped<UserRepository>();
        builder.Services.AddScoped<FollowingRepository>();
        builder.Services.AddScoped<UnitOfWork>();

        // DbContext
        builder.Services.AddScoped<SocialNetworkContext>();

        // Gestión Avatar
        builder.Services.AddScoped<IFileService, FileService>();

        // Auth & JWT
        builder.Services.AddScoped<TokenService>();
        builder.Services.AddScoped<AuthService>();

        builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                string? key = Environment.GetEnvironmentVariable("JWT_KEY");

                if (key is null)
                    throw new InvalidOperationException("JWT_KEY no definida.");

                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddSingleton<WebSocketManager>();

        // Swagger
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                Description = "Introduce el token JWT",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme
            });
            options.OperationFilter<SecurityRequirementsOperationFilter>(true, JwtBearerDefaults.AuthenticationScheme);
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseCors(policy =>
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        }

        app.UseHttpsRedirection();   // redirige HTTP a HTTPS
        var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");

        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        app.UseStaticFiles(new StaticFileOptions // permite servir archivos desde wwwroot y uploads
        {
            FileProvider = new PhysicalFileProvider(uploadsPath),
            RequestPath = "/uploads"
        });

        // WebSockets
        app.UseWebSockets();
        app.Map("/ws", async context =>
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            var socket = await context.WebSockets.AcceptWebSocketAsync();

            var userId = context.User.FindFirst("id")?.Value;
            if (userId is null)
            {
                context.Response.StatusCode = 401;
                return;
            }

            var wsManager = context.RequestServices.GetRequiredService<WebSocketManager>();
            wsManager.AddConnection(userId, socket);

            Console.WriteLine($"WebSocket conectado para usuario {userId}");

            var buffer = new byte[1024];
            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error WebSocket usuario {userId}: {ex.Message}");
            }
            finally
            {
                wsManager.RemoveConnection(userId);

                // Cerrar solo si está abierto
                if (socket.State == WebSocketState.Open)
                {
                    try
                    {
                        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                    }
                    catch
                    {
                        // Ignorar errores si el socket ya se cerró o abortó
                    }
                }

                Console.WriteLine($"WebSocket desconectado para usuario {userId}");
            }
        });

        app.UseAuthentication();     // middleware de autenticacion
        app.UseAuthorization();      // middleware de autorizacion

        app.MapControllers();        // mapea los endpoints de los controladores

        // Llamar al método antes de ejecutar la app
        await SeedDatabase(app.Services);

        app.Run();
    }

    // Método del seeder y creación de la base de datos
    private static async Task SeedDatabase(IServiceProvider serviceProvider)
    {
        using IServiceScope scope = serviceProvider.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();

        if (dbContext.Database.EnsureCreated())  // Esto crea la DB si no existe
        {
            Seeder seeder = new Seeder(dbContext);
            await seeder.SeedAsync();
        }
    }
}