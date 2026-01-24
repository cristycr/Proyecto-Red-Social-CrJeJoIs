using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Seeder;

public class Seeder {
    private readonly SocialNetworkContext _context;

    public Seeder(SocialNetworkContext context) {
        _context = context;
    }

    public void Seed() {
        // Crear usuarios
        User admin = new User { Email = "admin@example.com", Nickname = "admin", Name = "Administrador", Surname1 = "Sistema", Password = "admin123", Role = "admin" };

        User user1 = new User { Email = "user1@example.com", Nickname = "usuario1", Name = "Usuario", Surname1 = "Uno", Password = "1111", Role = "user" };

        User user2 = new User { Email = "user2@example.com", Nickname = "usuario2", Name = "Usuario", Surname1 = "Dos", Password = "2222", Role = "user" };

        _context.User.AddRange(admin, user1, user2);
        _context.SaveChanges();

        // Crear posts para cada usuario
        Post post1 = new Post { UserId = admin.Id, User = admin, Title = "Post admin 1", Description = "Contenido admin 1" };
        Post post2 = new Post { UserId = admin.Id, User = admin, Title = "Post admin 2", Description = "Contenido admin 2" };

        Post post3 = new Post { UserId = user1.Id, User = user1, Title = "Post user1 1", Description = "Contenido user1 1" };
        Post post4 = new Post { UserId = user1.Id, User = user1, Title = "Post user1 2", Description = "Contenido user1 2" };

        Post post5 = new Post { UserId = user2.Id, User = user2, Title = "Post user2 1", Description = "Contenido user2 1" };
        Post post6 = new Post { UserId = user2.Id, User = user2, Title = "Post user2 2", Description = "Contenido user2 2" };

        _context.Post.AddRange(post1, post2, post3, post4, post5, post6);
        _context.SaveChanges();

        // Crear relaciones Following
        Following f1 = new Following { IdFollower = user1.Id, IdFollowed = admin.Id };
        Following f2 = new Following { IdFollower = user2.Id, IdFollowed = admin.Id };

        _context.Following.AddRange(f1, f2);
        _context.SaveChanges();
    }
}
