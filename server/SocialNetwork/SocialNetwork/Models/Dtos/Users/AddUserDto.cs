namespace SocialNetwork.Models.Dtos.Users {
    public class AddUserDto {
        public required string Email { get; set; } 
        public required string Nickname { get; set; } //hace falta indicar que es requerido en los que la entidad son required?
        public string? AvatarPath { get; set; } = null;
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public string? Surname2 { get; set; } = null;
        public required string Password { get; set; }

    }
}
