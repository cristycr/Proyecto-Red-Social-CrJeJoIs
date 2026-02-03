namespace SocialNetwork.Models.Dtos.Posts {
    public class AddPostDto {
        public required long UserId { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
        public string? PicturePath { get; set; } = null;
    }
}
