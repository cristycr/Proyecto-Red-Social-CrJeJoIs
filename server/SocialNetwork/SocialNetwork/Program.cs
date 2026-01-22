using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.DataBase;

namespace SocialNetwork;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
            
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
            Console.WriteLine("Entrada al scope"); // ¿NOPROD?
            SocialNetworkContext dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();
            dbContext.Database.EnsureCreated();
            Console.WriteLine($"Base de datos creada en: {AppDomain.CurrentDomain.BaseDirectory}{SocialNetworkContext.DATABASE_PATH}"); // ¿NOPROD?
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
