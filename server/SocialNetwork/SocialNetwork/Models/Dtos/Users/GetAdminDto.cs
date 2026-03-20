namespace SocialNetwork.Models.Dtos.Users {
    public class GetAdminDto {
        public long Id { get; set; }
        public required string Nickname { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png"; //TO DO: en vez de imagen por defecto, hay que poner null y qie si es null añadirle x imagen
        public required string Email { get; set; }
        public string Role { get; set; } = "user";
    }
}
