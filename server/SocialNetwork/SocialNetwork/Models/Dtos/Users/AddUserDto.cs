namespace SocialNetwork.Models.Dtos.Users {
    public class AddUserDto {
        //public long Id { get; set; } //Duda,es necesario poner el id?
        public required string Email { get; set; } 
        public required string Nickname { get; set; } //hace falta indicar que es requerido en los que la entidad son required?
        public string AvatarPath { get; set; } = "/defaultAvatar.png"; //TO DO: Cambiar a la ruta de la imagen por defecto
        public required string Name { get; set; }
        public required string Surname1 { get; set; }
        public string? Surname2 { get; set; } = null;
        public required string Password { get; set; }

    }
}
