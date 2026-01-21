<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations.Schema;

=======
﻿using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
>>>>>>> e9f37d4c9b7e62f25e920016c7b0bd44b26ea760

namespace SocialNetwork.Models
{
    // Se puede usar una clave primaria compuesta para representar
    // la relación de seguimiento entre usuarios
    [PrimaryKey(nameof(IdFollower), nameof(IdFollowed))]
    public class Following
    {
<<<<<<< HEAD
        public long Id { get; set; }
        // --- RELACIÓN 1: El que sigue ---
        public required long Follower { get; set; }

        [ForeignKey("Follower")] // Le decimos: "El objeto de abajo se llena usando la clave de arriba 'Follower'"
        public required User UserFollower { get; set; } // Objeto de navegación

        // --- RELACIÓN 2: El seguido ---
        public required long Followed { get; set; }

        [ForeignKey("Followed")] 
        public required User UserFollowed { get; set; } 
=======
        public required long IdFollower { get; set; }
        public required long IdFollowed { get; set; }

        // Estas propiedades de navegación establecen la relación con la entidad User
        public User Follower { get; set; } = null!;
        public User Followed { get; set; } = null!;
>>>>>>> e9f37d4c9b7e62f25e920016c7b0bd44b26ea760
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
