using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models;

namespace SocialNetwork;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();

        // Configuración del DbContext para usar SQLite
        builder.Services.AddDbContext<SocialNetworkContext>(options =>
        {
            // Aquí indicamos SQLite y la ruta de la base de datos
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            options.UseSqlite($"DataSource={baseDir}socialnetwork.db");
        });

        builder.Services.AddOpenApi();

        // Añadimos el DbContext al servicio de inyección de dependencias
        // Tiene que ser scoped para que cierre la conexión y limpie
        // los recursos tras cada petición
        builder.Services.AddScoped<SocialNetworkContext>();

        var app = builder.Build();

        // Creamos un scope y nos aseguramos de que se crea la base de datos según
        // tengamos configurado nuestro DbContext
        using (IServiceScope scope = app.Services.CreateScope())
        {
            SocialNetworkContext dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();
            dbContext.Database.EnsureCreated();
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();

            app.UseCors(policy =>
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();


        app.MapControllers();

        app.Run();
    }
}
