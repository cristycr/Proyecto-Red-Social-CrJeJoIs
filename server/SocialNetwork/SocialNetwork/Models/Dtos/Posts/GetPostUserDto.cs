namespace SocialNetwork.Models.Dtos.Posts {
    public class GetPostUserDto {
        public long Id { get; set; }
        public required long UserId { get; set; }
        public required string Nickname { get; set; }
        public string? AvatarPath { get; set; } = null;
        public DateTime CreationDate { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}
