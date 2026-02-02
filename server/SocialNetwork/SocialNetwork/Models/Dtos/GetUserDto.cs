namespace SocialNetwork.Models.Dtos {
    public class GetUserDto {
        public long Id { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
