namespace SocialNetwork.Models.Dtos.Following
{
    public class FollowingDto
    {
        //Este DTO es de salida. Se usa cuando se quiere mostrar
        //la lista de seguidores o seguidos
        public long Id { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname1 { get; set; } = string.Empty; 
        public string? AvatarPath { get; set; } // Puede ser null

        //Si queremos mostrar la "bio" en la lista, descomentar la línea de abajo
        // public string? Description { get; set; }
    }
}
