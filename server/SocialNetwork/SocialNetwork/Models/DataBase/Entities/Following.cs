using Microsoft.EntityFrameworkCore;

namespace SocialNetwork.Models.Database.Entities {
    // Se puede usar una clave primaria compuesta para representar
    // la relación de seguimiento entre usuarios
    [PrimaryKey(nameof(FollowerId), nameof(FollowedId))]
    public class Following {
        public long FollowerId { get; set; }
        public User? Follower { get; set; }
        public long FollowedId { get; set; }
        public User? Followed { get; set; }
    }
}
