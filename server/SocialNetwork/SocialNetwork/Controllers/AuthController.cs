using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Enum;
using SocialNetwork.Models.Dtos.Auth;
using SocialNetwork.Models.Dtos.Users;
using SocialNetwork.Services.Auth;

namespace SocialNetwork.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.LoginAsync(model);

            if (token is null)
                return Unauthorized("Credenciales invalidas");

            return Ok(new AuthResponseDto
            {
                AccessToken = token
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] AddUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? error = await _authService.CheckUserExists(dto.Email, dto.Nickname);

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);

            RegisterResult result = await _authService.RegisterAsync(dto);

            return result switch
            {
                RegisterResult.Success => Ok(),
                RegisterResult.EmailAlreadyExists => BadRequest("El email ya existe."),
                RegisterResult.NicknameAlreadyExists => BadRequest("El nickname ya existe."),
                RegisterResult.InvalidData => BadRequest("Datos inválidos."),
                _ => BadRequest("No se pudo registrar el usuario.")
            };
        }
    }
}