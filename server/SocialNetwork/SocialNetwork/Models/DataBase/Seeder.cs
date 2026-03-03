using SocialNetwork.Helpers;
using SocialNetwork.Models.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace SocialNetwork.Models.Database;

public class Seeder {
    private readonly SocialNetworkContext _context;

    public Seeder(SocialNetworkContext context) {
        _context = context;
    }
    public async Task SeedAsync()
    {
        if (await _context.User.AnyAsync()) return;

        // Crear usuarios
        User admin = new User { Email = "admin@example.com", Nickname = "admin", Name = "Administrador", Surname1 = "Sistema", Password = PasswordHelper.Hash("admin123"), Role = "admin" };
        User user1 = new User { Email = "user1@example.com", Nickname = "usuario1", Name = "Usuario", Surname1 = "Uno", Password = PasswordHelper.Hash("1111"), Role = "user" };
        User user2 = new User { Email = "user2@example.com", Nickname = "usuario2", Name = "Usuario", Surname1 = "Dos", Password = PasswordHelper.Hash("2222"), Role = "user" };

        await _context.User.AddRangeAsync(admin, user1, user2);
        await _context.SaveChangesAsync();

        // Crear posts para cada usuario
        for (int i = 1; i <= 100; i++)
        {
            await _context.Post.AddRangeAsync(
                new Post { UserId = admin.Id, User = admin, Title = $"Post admin {i}", Description = $"Contenido admin {i}" },
                new Post { UserId = user1.Id, User = user1, Title = $"Post user1 {i}", Description = $"Contenido user1 {i}" },
                new Post { UserId = user2.Id, User = user2, Title = $"Post user2 {i}", Description = $"Contenido user2 {i}" }
            );
        }
        await _context.SaveChangesAsync();

        // Crear relaciones Following
        await _context.Following.AddRangeAsync(
            new Following { FollowerId = user1.Id, FollowedId = admin.Id },
            new Following { FollowerId = user2.Id, FollowedId = admin.Id }
        );
        await _context.SaveChangesAsync();
    }
}