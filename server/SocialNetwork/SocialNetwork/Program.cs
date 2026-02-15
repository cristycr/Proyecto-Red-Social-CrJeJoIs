using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Models.Database.Seeder;
using SocialNetwork.Services;
using Swashbuckle.AspNetCore.Filters;
using System.Security.Claims;
using System.Text;

namespace SocialNetwork;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        

        // Repositorios
        builder.Services.AddScoped<PostRepository>();
        builder.Services.AddScoped<UserRepository>();
        builder.Services.AddScoped<FollowingRepository>();

        // Añadimos el DbContext al servicio de inyeccion de dependencias
        builder.Services.AddScoped<SocialNetworkContext>();
        builder.Services.AddScoped<UnitOfWork>();

        // Autenticacion JWT
        builder.Services.AddScoped<TokenService>();
        builder.Services.AddScoped<AuthService>();
        builder.Services.AddScoped<PostService>();
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

        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                Description = "Escribe",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme
            });
            options.OperationFilter<SecurityRequirementsOperationFilter>(true, JwtBearerDefaults.AuthenticationScheme);
        });

        var app = builder.Build();
        
        // Configure the HTTP request pipeline.
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
        app.UseStaticFiles();        // permite servir archivos desde wwwroot
        app.UseAuthentication();     // middleware de autenticacion
        app.UseAuthorization();      // middleware de autorizacion
        app.MapControllers();        // mapea los endpoints de los controladores

        // Llamar al método antes de ejecutar la app
        SeedDatabase(app.Services);
        app.Run();

        // Método del seeder y creación de la base de datos
        static void SeedDatabase(IServiceProvider serviceProvider) {
            using IServiceScope scope = serviceProvider.CreateScope();
            using SocialNetworkContext dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();

            if (dbContext.Database.EnsureCreated()) // Esto crea la DB si no existe
            {
                Seeder seeder = new Seeder(dbContext);
                seeder.Seed();
            }
        }
    }
}