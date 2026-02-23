namespace SocialNetwork.Models.Dtos.Users {
    public class GetUserProfileDto {
        public long Id { get; set; }
        public required string Nickname { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png";
        public string? Biography { get; set; }
        public int FollowedCount { get; set; }
        public int FollowerCount { get; set; }
    }
}
