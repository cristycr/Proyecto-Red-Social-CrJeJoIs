namespace SocialNetwork.Models.Dtos.Users {
    public class GetUserDto {
        public long Id { get; set; }
        public required string Nickname { get; set; }
        public string AvatarPath { get; set; } = "/defaultAvatar.png"; //TO DO: Cambiar a la ruta de la imagen por defecto
        //una vez se haga una peticion get, el usuario va a tener una imagen (pordefecto o personalizada)
        //El valor nunca sera null, entonces, hay que indicar el required y quitar el null?
    }
}
