namespace SocialNetwork.Models.Dtos.Posts {
    public class GetPostDto {
        public long Id { get; set; }
        public required long UserId { get; set; }
        public string Nickname { get; set; } = null!;   //Esta propiedad muestra el nombre del autor
        public DateTime CreationDate { get; set; }
        public string? Title { get; set; }
        public string Description { get; set; } = null!;
        public string? PicturePath { get; set; } = null;
    }
}