using System.ComponentModel.DataAnnotations;

namespace SocialNetwork.Models.Dtos.Users {
    public class AddUserDto {
        [Required]
        [EmailAddress]
        [StringLength(254)]
        public required string Email { get; set; } = null!;

        [Required]
        [StringLength(30, MinimumLength = 3)]
        public required string Nickname { get; set; } = null!;

        public string? AvatarPath { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public required string Name { get; set; } = null!;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public required string Surname1 { get; set; } = null!;

        [StringLength(50)]
        public string? Surname2 { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; } = null!;
    }
}
