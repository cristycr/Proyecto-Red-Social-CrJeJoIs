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
        builder.Services.AddScoped<SocialNetworkContext>();
        builder.Services.AddScoped<UnitOfWork>();
      
        var app = builder.Build();
        
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
