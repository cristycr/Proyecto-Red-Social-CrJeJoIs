using Microsoft.EntityFrameworkCore;
namespace SocialNetwork.Models;

public class SocialNetworkContext : DbContext // Tiene que heredar de DbContext
{
    private const string DATABASE_PATH = "socialnetwork.db"; //PENDIENTE DE CAMBIAR

    //Tablas
    public DbSet<Following> Following { get; set; }
    public DbSet<Post> Post { get; set; }
    public DbSet<User> User { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
    }
}

// En el DbContext, dentro del OnModelCreating,
// se debe configurar la relación con un código similar a este:
// 
//  modelBuilder.Entity<Following>()
//      .HasOne(f => f.Follower) // La propiedad en Following que representa al seguidor
//      .WithMany(u => u.Following) // La colección en User que representa a los seguidos
//      .HasForeignKey(f => f.IdFollower) // La clave foránea en Following
//      .OnDelete(DeleteBehavior.Restrict); // Evita eliminaciones en cascada
//
//  modelBuilder.Entity<Following>()
//      .HasOne(f => f.Followed) // La propiedad en Following que representa al seguido
//      .WithMany(u => u.Followers) // La colección en User que representa a los seguidores
//      .HasForeignKey(f => f.IdFollowed) // La clave foránea en Following
//      .OnDelete(DeleteBehavior.Restrict); // Evita eliminaciones en cascada
