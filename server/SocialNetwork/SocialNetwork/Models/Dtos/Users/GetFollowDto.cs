namespace SocialNetwork.Models.Dtos.Users {
    public class GetFollowDto {
        public long Id { get; set; }
        public required string Nickname { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png";
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public string? Surname2 { get; set; }
    }
}
