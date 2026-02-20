using SocialNetwork.Helpers;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Auth;

namespace SocialNetwork.Services {
    public class AuthService {
        private readonly UnitOfWork _unitOfWork;
        private readonly TokenService _tokenService;

        public AuthService(UnitOfWork unitOfWork, TokenService tokenService) {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
        }

        public async Task<string?> LoginAsync(LoginModel model) {
            // Si el usuario existe entonces creamos y le damos su token
            User? user = await _unitOfWork.UserRepository.GetUserByNicknameAsync(model.Nickname);

            if (user is null)
                return null;

            if (!PasswordHelper.Verify(model.Password, user.Password))
                return null;

            // Delegamos la creación del token
            return _tokenService.CreateToken(user);
        }

        public async Task<string?> CheckUserExists(string email, string nickname) {
            User? user = await _unitOfWork.UserRepository.GetUserByNicknameAsync(nickname);
            if (user != null) {
                // Mensaje de "error" de que existe el usuario con ese nickname
                return "nickname";
            }

            user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (user != null) {
                // Mensaje de "error" de que existe el usuario con ese email
                return "email";
            }

            return null;
        }
        /*
        public async Task<string?> RegisterAsync() {
            
        }*/
    }
}