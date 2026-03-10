using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database;
public class SocialNetworkContext : DbContext // Tiene que heredar de DbContext
{
    private const string DATABASE_PATH = "socialnetwork.db";

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
            .HasForeignKey(f => f.FollowerId) // La clave foránea en Following
            .OnDelete(DeleteBehavior.Cascade); // Eliminar seguimientos cuando se borra el usuario

        modelBuilder.Entity<Following>()
            .HasOne(f => f.Followed) // La propiedad en Following que representa al seguido
            .WithMany(u => u.Followers) // La colección en User que representa a los seguidores
            .HasForeignKey(f => f.FollowedId) // La clave foránea en Following
            .OnDelete(DeleteBehavior.Cascade); // Eliminar seguimientos cuando se borra el usuario

        modelBuilder.Entity<Post>() // ¿Mantener?
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<Following>() // Restricción para evitar auto-follow
            .ToTable(t => t.HasCheckConstraint(
            "CK_Following_NoSelfFollow",
            "FollowerId <> FollowedId"
    ));
    }
}