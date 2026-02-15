namespace SocialNetwork.Models.Dtos.Posts {
    public class AddPostDto {
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
        public string? PicturePath { get; set; } = null;
    }
}
