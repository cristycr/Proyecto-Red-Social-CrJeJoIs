using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SocialNetwork.Helpers;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Models.Dtos.Auth;
using SocialNetwork.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
    }
}