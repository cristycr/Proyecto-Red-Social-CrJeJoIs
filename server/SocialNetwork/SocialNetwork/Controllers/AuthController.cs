using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Dtos.Auth;
using SocialNetwork.Models.Dtos.Users;
using SocialNetwork.Services;

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
        public async Task<ActionResult<string>> Login([FromBody] LoginModel model)
        {
            var token = await _authService.LoginAsync(model);

            if (token is null)
                return Unauthorized("Credenciales invalidas");

            return Ok(new { accessToken = token });
        }

        [HttpPost("register")]
        public async Task<ActionResult<AddUserDto>> Register([FromBody] AddUserDto dto) {
            if (!ModelState.IsValid) {
                return BadRequest("Datos inválidos");
            }

            string? error = await _authService.CheckUserExists(dto.Email, dto.Nickname);
            
            if(!string.IsNullOrEmpty(error))
                return BadRequest(error);

            bool success = await _authService.RegisterAsync(dto);

            if (!success) {
                return BadRequest(new { error = "No se pudo registrar el usuario." });
            }

            return Ok(dto);
        }
    }
}