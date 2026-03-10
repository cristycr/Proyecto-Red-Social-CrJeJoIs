using SocialNetwork.Enum;
using SocialNetwork.Helpers;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Auth;
using SocialNetwork.Models.Dtos.Users;

namespace SocialNetwork.Services.Auth
{
    public class AuthService(UnitOfWork unitOfWork, TokenService tokenService)
    {
        private readonly UnitOfWork _unitOfWork = unitOfWork;
        private readonly TokenService _tokenService = tokenService;

        public async Task<string?> LoginAsync(LoginModel model)
        {
            // Si el usuario existe entonces creamos y le damos su token
            User? user = await _unitOfWork.UserRepository.GetUserByNicknameAsync(model.Nickname);

            if (user is null)
                return null;

            if (!PasswordHelper.Verify(model.Password, user.Password))
                return null;

            // Delegamos la creación del token
            return _tokenService.CreateToken(user);
        }

        public async Task<string?> CheckUserExists(string email, string nickname)
        {
            User? user = await _unitOfWork.UserRepository.GetUserByNicknameAsync(nickname);
            if (user != null)
            {
                return "Existe el usuario con ese nickname";
            }

            user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (user != null)
            {
                return "Existe el usuario con ese email";
            }

            return null;
        }

        public async Task<RegisterResult> RegisterAsync(AddUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Nickname) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return RegisterResult.InvalidData;
            }

            var existingEmail = await _unitOfWork.UserRepository
                .GetUserByEmailAsync(dto.Email);

            if (existingEmail != null)
                return RegisterResult.EmailAlreadyExists;

            var existingNickname = await _unitOfWork.UserRepository
                .GetUserByNicknameAsync(dto.Nickname);

            if (existingNickname != null)
                return RegisterResult.NicknameAlreadyExists;

            var userEntity = new User
            {
                Email = dto.Email,
                Nickname = dto.Nickname,
                Name = dto.Name,
                Surname1 = dto.Surname1,
                Surname2 = dto.Surname2,
                Password = PasswordHelper.Hash(dto.Password),
                Role = "user"
            };

            try
            {
                await _unitOfWork.UserRepository.InsertAsync(userEntity);
                bool saved = await _unitOfWork.SaveAsync();

                return saved ? RegisterResult.Success : RegisterResult.Error;
            }
            catch
            {
                return RegisterResult.Error;
            }
        }
    }
}