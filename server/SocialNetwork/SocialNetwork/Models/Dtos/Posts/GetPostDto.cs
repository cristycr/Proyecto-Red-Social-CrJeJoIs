namespace SocialNetwork.Models.Dtos.Posts {
    public class GetPostDto {
        public long Id { get; set; }
        public required long UserId { get; set; }
        public DateTime CreationDate { get; set; }
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
        public string? PicturePath { get; set; } = null;
    }
}