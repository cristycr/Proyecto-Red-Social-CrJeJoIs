namespace SocialNetwork.Models.Dtos.Following
{
    public class GetFollowingDto
    {
        public long FollowerId { get; set; }
        public long FollowedId { get; set; }
    }
}
