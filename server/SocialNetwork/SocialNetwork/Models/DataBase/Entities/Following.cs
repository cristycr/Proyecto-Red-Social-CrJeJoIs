using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialNetwork.Models.DataBase.Entities
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
