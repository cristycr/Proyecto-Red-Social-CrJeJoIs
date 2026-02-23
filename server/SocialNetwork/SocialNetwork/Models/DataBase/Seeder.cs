using SocialNetwork.Helpers;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Seeder;

public class Seeder {
    private readonly SocialNetworkContext _context;

    public Seeder(SocialNetworkContext context) {
        _context = context;
    }
    public void Seed() {
        // Crear usuarios
        User admin = new User { Email = "admin@example.com", Nickname = "admin", Name = "Administrador", Surname1 = "Sistema", Password = PasswordHelper.Hash("admin123"), Role = "admin" };

        User user1 = new User { Email = "user1@example.com", Nickname = "usuario1", Name = "Usuario", Surname1 = "Uno", Password = PasswordHelper.Hash("1111"), Role = "user" };

        User user2 = new User { Email = "user2@example.com", Nickname = "usuario2", Name = "Usuario", Surname1 = "Dos", Password = PasswordHelper.Hash("2222"), Role = "user" };

        // Crear posts para cada usuario

        for (int i = 1; i <= 100; i++) {
            Post postAdmin = new Post { UserId = admin.Id, User = admin, Title = $"Post admin {i}", Description = $"Contenido admin {i}" };
            Post postUser1 = new Post { UserId = user1.Id, User = user1, Title = $"Post user1 {i}", Description = $"Contenido user1 {i}" };
            Post postUser2 = new Post { UserId = user2.Id, User = user2, Title = $"Post user2 {i}", Description = $"Contenido user2 {i}" };
            _context.Post.AddRange(postAdmin, postUser1, postUser2);
        }
        _context.User.AddRange(admin, user1, user2);
        _context.SaveChanges();

        // Crear relaciones Following
        Following f1 = new Following { FollowerId = user1.Id, FollowedId = admin.Id };
        Following f2 = new Following { FollowerId = user2.Id, FollowedId = admin.Id };

        _context.Following.AddRange(f1, f2);
        _context.SaveChanges();
    }
}
