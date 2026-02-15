namespace SocialNetwork.Models.Database.Entities;
public class Post {
    public long Id { get; set; }
    public required long UserId { get; set; }
    // La fecha de creación se inicializa con la fecha y hora actual en UTC
    // Si se utiliza DateTime.Now, la hora se guarda en función de la zona horaria del servidor
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    public string? Title { get; set; }
    public string? Description { get; set; }
    // Establece la relación con la entidad User
    public virtual User? User { get; set; }
    //Se modifica de required a vitual más ? para "relajar" la regla en la Entidad
}
