using System.ComponentModel.DataAnnotations;

namespace SocialNetwork.Models.Dtos.Users
{
    public class AddUserDto
    {
        [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
        [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
        [StringLength(254, ErrorMessage = "El correo electrónico no puede superar los 254 caracteres.")]
        public required string Email { get; set; } = null!;

        [Required(ErrorMessage = "El nickname es obligatorio.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "El nickname debe tener minimo 3 caracteres.")]
        public required string Nickname { get; set; } = null!;

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener minimo 2 caracteres.")]
        public required string Name { get; set; } = null!;

        [Required(ErrorMessage = "El primer apellido es obligatorio.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "El primer apellido debe tener minimo 2 caracteres.")]
        public required string Surname1 { get; set; } = null!;

        [StringLength(50, ErrorMessage = "El segundo apellido no puede superar los 50 caracteres.")]
        public string? Surname2 { get; set; }

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener minimo 6 caracteres.")]
        public required string Password { get; set; } = null!;
    }
}