namespace SocialNetwork.Models;

using Microsoft.EntityFrameworkCore;

[Index(nameof(Email), IsUnique = true)]
[Index(nameof(Nickname), IsUnique = true)]
public class User {
    public long Id { get; set; }
    public required string Email { get; set; }
    public required string Nickname { get; set; }
    public required string Name { get; set; }
    public required string Surname1 { get; set; }
    public required string Password { get; set; }
    public required string Role { get; set; } = "user";
    public string? Surname2 { get; set; }
    public string? AvatarPath { get; set; }
    public string? Description { get; set; }

    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<Following> Following { get; set; } = [];
    public ICollection<Following> Followers { get; set; } = [];

}
