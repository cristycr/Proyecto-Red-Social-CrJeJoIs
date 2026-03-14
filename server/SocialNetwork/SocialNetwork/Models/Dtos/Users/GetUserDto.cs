namespace SocialNetwork.Models.Dtos.Users {
    public class GetUserDto {
        public long Id { get; set; }
        public required string Nickname { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png"; //TO DO: en vez de imagen por defecto, hay que poner null y qie si es null añadirle x imagen
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public string? Surname2 { get; set; }
    }
}