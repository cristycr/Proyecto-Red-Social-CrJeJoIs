//Dto para ver todo durante el desarrollo.
namespace SocialNetwork.Models.Dtos.Users {
    public class GetAllUserDto {
        public long Id { get; set; }
        public required string Email { get; set; }
        public required string Nickname { get; set; }
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public required string Password { get; set; }
        public string? Role { get; set; }
        public string? Surname2 { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png";
        public string? Biography { get; set; }
    }
}
