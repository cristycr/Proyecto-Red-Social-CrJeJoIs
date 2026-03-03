using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Services.Internal;
// Este servicio va a poblar la base de datos de SocialNetwork
public class DataLoader
{

    private readonly SocialNetworkContext _context;

    public DataLoader(SocialNetworkContext context)
    {
        _context = context;
    }

    public async Task LoadAllDataAsync()
    {
        await LoadUsersAsync();
        await LoadPostsAsync();
        await LoadFollowingsAsync();
    }

    private async Task LoadUsersAsync()
    {
        if (await _context.User.AnyAsync()) return;

        User admin = new User { Email = "admin@example.com", Nickname = "admin", Name = "Administrador", Surname1 = "Sistema", Password = Helpers.PasswordHelper.Hash("admin123"), Role = "admin" };
        User user1 = new User { Email = "user1@example.com", Nickname = "usuario1", Name = "Usuario", Surname1 = "Uno", Password = Helpers.PasswordHelper.Hash("1111"), Role = "user" };
        User user2 = new User { Email = "user2@example.com", Nickname = "usuario2", Name = "Usuario", Surname1 = "Dos", Password = Helpers.PasswordHelper.Hash("2222"), Role = "user" };

        await _context.User.AddRangeAsync(admin, user1, user2);
        await _context.SaveChangesAsync();
    }

    private async Task LoadPostsAsync()
    {
        var users = await _context.User.ToListAsync();

        int postCount = 100;
        foreach (var user in users)
        {
            for (int i = 1; i <= postCount; i++)
            {
                await _context.Post.AddAsync(new Post { UserId = user.Id, User = user, Title = $"Post {user.Nickname} {i}", Description = $"Contenido {i} de {user.Nickname}" });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task LoadFollowingsAsync()
    {
        var users = await _context.User.ToListAsync();
        var admin = users.FirstOrDefault(u => u.Nickname == "admin");
        if (admin == null) return;

        foreach (var user in users.Where(u => u.Id != admin.Id))
        {
            await _context.Following.AddAsync(new Following { FollowerId = user.Id, FollowedId = admin.Id });
        }

        await _context.SaveChangesAsync();
    }
}