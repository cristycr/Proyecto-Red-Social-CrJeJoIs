namespace SocialNetwork.Models.Database.Entities;
public class Post {
    public long Id { get; set; }
    // La fecha de creación se inicializa con la fecha y hora actual en UTC
    // Si se utiliza DateTime.Now, la hora se guarda en función de la zona horaria del servidor
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    public required string Title { get; set; }
    public required string Description { get; set; }
    // Establece la relación con la entidad User
    public long UserId { get; set; }
    public User? User { get; set; }
}
