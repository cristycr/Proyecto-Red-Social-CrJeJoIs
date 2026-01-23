namespace SocialNetwork.Models.Database.Entities;
public class Post {
    public long Id { get; set; }
    public required long UserId { get; set; }
    // La fecha de creación se inicializa con la fecha y hora actual en UTC
    // Si se utiliza DateTime.Now, la hora se guarda en función de la zona horaria del servidor
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    // Campos opcionales
    // Se escriben con el sufijo ? para indicar que pueden ser nulos
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? PicturePath { get; set; }
    // Establece la relación con la entidad User
    public required User User { get; set; }
}
