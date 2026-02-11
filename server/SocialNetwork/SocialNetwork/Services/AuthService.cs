using SocialNetwork.Helpers;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Models.Dtos.Auth;

namespace SocialNetwork.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepository;
        private readonly TokenService _tokenService;

        public AuthService(UserRepository userRepository, TokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<string?> LoginAsync(LoginModel model)
        {
            // Si el usuario existe entonces creamos y le damos su token
            User? user = await _userRepository.GetUserByNicknameAsync(model.Nickname);

            if (user is null)
                return null;

            if (!PasswordHelper.Verify(model.Password, user.Password))
                return null;

            // Delegamos la creación del token
            return _tokenService.CreateToken(user);
        }
    }
}