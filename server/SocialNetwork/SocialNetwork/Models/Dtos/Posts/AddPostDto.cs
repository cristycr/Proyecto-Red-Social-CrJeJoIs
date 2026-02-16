namespace SocialNetwork.Models.Dtos.Posts {
    public class AddPostDto {
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public string? Title { get; set; } = null;
        public required string Description { get; set; }
        public string? PicturePath { get; set; } = null;
    }
}
