namespace SocialNetwork.Models;
public class Post {
    public long Id { get; set; }
    public required long UserId { get; set; }
    public required User User { get; set; }
    public required DateTime CreationDate { get; set; } = DateTime.Now; // DateTime.UtcNow?
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty; // ?? Es de tipo string
}
