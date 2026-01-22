using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.DataBase.Entities;
namespace SocialNetwork.Models.DataBase;

public class SocialNetworkContext : DbContext // Tiene que heredar de DbContext
{
    public static readonly string DATABASE_PATH = "socialnetwork.db";

    //Tablas
    public DbSet<Following> Following { get; set; }
    public DbSet<Post> Post { get; set; }
    public DbSet<User> User { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Following>()
            .HasOne(f => f.Follower) // La propiedad en Following que representa al seguidor
            .WithMany(u => u.Following) // La colección en User que representa a los seguidos
            .HasForeignKey(f => f.IdFollower) // La clave foránea en Following
            .OnDelete(DeleteBehavior.Restrict); // Evita eliminaciones en cascada

        modelBuilder.Entity<Following>()
            .HasOne(f => f.Followed) // La propiedad en Following que representa al seguido
            .WithMany(u => u.Followers) // La colección en User que representa a los seguidores
            .HasForeignKey(f => f.IdFollowed) // La clave foránea en Following
            .OnDelete(DeleteBehavior.Restrict); // Evita eliminaciones en cascada

        modelBuilder.Entity<Post>() // ¿Mantener?
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<Following>() // Añadimos la restricción para evitar auto-follow
            .ToTable(t => t.HasCheckConstraint(
            "CK_Following_NoSelfFollow",
            "IdFollower <> IdFollowed"
    ));

    }
}