namespace SocialNetwork.Models.Dtos.Users {
    public class PutUserDto {
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public string? Surname2 { get; set; }
        public string? Biography { get; set; }
    }
}
