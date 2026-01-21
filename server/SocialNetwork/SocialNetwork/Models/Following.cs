using System.ComponentModel.DataAnnotations.Schema;


namespace SocialNetwork.Models
{
    public class Following
    {
        public long Id { get; set; }
        // --- RELACIÓN 1: El que sigue ---
        public required long Follower { get; set; }

        [ForeignKey("Follower")] // Le decimos: "El objeto de abajo se llena usando la clave de arriba 'Follower'"
        public required User UserFollower { get; set; } // Objeto de navegación

        // --- RELACIÓN 2: El seguido ---
        public required long Followed { get; set; }

        [ForeignKey("Followed")] 
        public required User UserFollowed { get; set; } 
    }
}
