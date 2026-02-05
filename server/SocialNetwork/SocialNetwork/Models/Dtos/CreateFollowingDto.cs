namespace SocialNetwork.Models.Dtos
{
    public class CreateFollowingDto
    {
        //Este DTO es el formulario de entrada
        //Se usa cuando un usuario quiere seguir a otro (POST)
        public long FollowerId { get; set; }
        public long FollowedId { get; set; }
    }
}
