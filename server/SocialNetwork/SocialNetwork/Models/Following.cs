using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialNetwork.Models
{
    [PrimaryKey(nameof(IdFollower), nameof(IdFollowed))]
    public class Following
    {
        public required long IdFollower { get; set; }
        public required long IdFollowed { get; set; }

        public User Follower { get; set; } = null!;
        public User Followed { get; set; } = null!;
    }
}
