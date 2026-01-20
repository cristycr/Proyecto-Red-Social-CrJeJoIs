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
    public required string role { get; set; } = "user";
    public string Surname2 { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<Following> Followings { get; set; } = [];

}
