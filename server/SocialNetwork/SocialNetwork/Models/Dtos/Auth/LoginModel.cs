using System.ComponentModel.DataAnnotations;

namespace SocialNetwork.Models.Dtos.Auth;

public class LoginModel
{
    [Required]
    public required string Nickname { get; set; }
    [Required]
    public required string Password { get; set; }
}