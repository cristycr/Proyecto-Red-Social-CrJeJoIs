using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialNetwork.Models
{
    // Se puede usar una clave primaria compuesta para representar
    // la relación de seguimiento entre usuarios
    [PrimaryKey(nameof(IdFollower), nameof(IdFollowed))]
    public class Following
    {
        public required long IdFollower { get; set; }
        public required long IdFollowed { get; set; }

        // Estas propiedades de navegación establecen la relación con la entidad User
        public User Follower { get; set; } = null!;
        public User Followed { get; set; } = null!;
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
