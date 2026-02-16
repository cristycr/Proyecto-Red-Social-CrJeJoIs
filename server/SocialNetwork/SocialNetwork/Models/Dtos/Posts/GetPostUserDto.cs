namespace SocialNetwork.Models.Dtos.Posts {
    public class GetPostUserDto {
        public long Id { get; set; }
        public required long UserId { get; set; }
        //public string? Nickname { get; set; }
        public string? AvatarPath { get; set; } = null;
        public DateTime CreationDate { get; set; }
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
    }
}
