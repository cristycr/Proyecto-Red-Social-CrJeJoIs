using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Services;
using SocialNetwork.Services.Auth;
using Swashbuckle.AspNetCore.Filters;
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
                // Por seguridad guardamos la clave privada en variables de entorno
                // La clave debe tener más de 256 bits
                string? key = Environment.GetEnvironmentVariable("JWT_KEY");

                if (key is null)
                    throw new InvalidOperationException("La variable de entorno JWT_KEY no está definida.");

                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    // Si no nos importa que se valide el emisor del token, lo desactivamos
                    ValidateIssuer = false,
                    // Si no nos importa que se valide para quién o
                    // para qué propósito está destinado el token, lo desactivamos
                    ValidateAudience = false,
                    // Indicamos la clave
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    RoleClaimType = ClaimTypes.Role // para [Authorize(Roles="...")]
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

        app.UseAuthentication();     // middleware de autenticacion
        app.UseAuthorization();      // middleware de autorizacion
        app.MapControllers();        // mapea los endpoints de los controladores
        app.UseWebSockets();

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