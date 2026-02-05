using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Models.Database.Seeder;

namespace SocialNetwork;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddOpenApi();

        // Repositorios
        builder.Services.AddScoped<PostRepository>();
        builder.Services.AddScoped<UserRepository>();
        builder.Services.AddScoped<FollowingRepository>();

        // Añadimos el DbContext al servicio de inyeccion de dependencias
        // Tiene que ser scoped para que cierre la conexion y limpie
        // los recursos tras cada peticion
        builder.Services.AddScoped<SocialNetworkContext>();
        builder.Services.AddScoped<UnitOfWork>();
      
        var app = builder.Build();
      
        // Creamos un scope y nos aseguramos de que se crea la base de datos segun
        // tengamos configurado nuestro DbContext
        using (IServiceScope scope = app.Services.CreateScope())
        {
            //Console.WriteLine("Entrada al scope"); // NOPROD
            SocialNetworkContext dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();
            //dbContext.Database.EnsureCreated();
            //Console.WriteLine($"Base de datos creada en: {AppDomain.CurrentDomain.BaseDirectory}{SocialNetworkContext.DATABASE_PATH}"); // NOPROD
        }
      
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "v1"));
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

        static void SeedDatabase(IServiceProvider serviceProvider)
        {
            using IServiceScope scope = serviceProvider.CreateScope();
            using SocialNetworkContext dbContext = scope.ServiceProvider.GetRequiredService<SocialNetworkContext>();

            if (dbContext.Database.EnsureCreated()) // Esto crea la DB si no existe
            {
                Seeder seeder = new Seeder(dbContext);
                seeder.Seed();
            }
        }

        // Llamar al método antes de ejecutar la app
        SeedDatabase(app.Services);
        app.Run();
    }
}
