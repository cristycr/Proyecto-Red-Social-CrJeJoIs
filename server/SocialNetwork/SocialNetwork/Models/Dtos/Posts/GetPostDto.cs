namespace SocialNetwork.Models.Dtos.Posts {
    public class GetPostDto {
        public long Id { get; set; }
        public required long UserId { get; set; }
        public DateTime CreationDate { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}