namespace SocialNetwork.Models;
public class Post {
    public long Id { get; set; }
    public required long UserId { get; set; }
    public required User User { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow; // DateTime.UtcNow?
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? PicturePath { get; set; }
}
