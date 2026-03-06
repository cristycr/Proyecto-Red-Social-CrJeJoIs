namespace SocialNetwork.Models.Dtos.Posts {
    public class AddPostDto {
        public required long UserId { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}
