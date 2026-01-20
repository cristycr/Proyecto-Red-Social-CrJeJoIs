namespace SocialNetwork.Models
{
    public class Following
    {
        public long Id { get; set; }
        public required long Follower { get; set; }
        public required User UserFollower { get; set; }
        public required long Followed { get; set; }
        public required User UserFollowed { get; set; }
    }
}
