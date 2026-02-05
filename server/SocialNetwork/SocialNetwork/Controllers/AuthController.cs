using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SocialNetwork.Models.Dtos.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SocialNetwork.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Obtenemos por inyección los parámetros preestablecidos
        // para crear los token
        private readonly TokenValidationParameters _tokenParameters;

        public AuthController(IOptionsMonitor<JwtBearerOptions> jwtOptions)
        {
            _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme)
            .TokenValidationParameters;
        }

        [HttpPost("login")]
        public ActionResult<string> Login([FromBody] LoginModel model)
        {
            // Si el usuario existe entonces creamos y le damos su token
            if (model.UserName == "admin" && model.Password == "admin123")
            {
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    // Aquí añadimos los datos que sirvan para autorizar al usuario
                    Claims = new Dictionary<string, object>
                        {
                            { "id", Guid.NewGuid().ToString() },
                            { ClaimTypes.Role, "admin" }
                        },
                    // Aquí indicamos cuándo caduca el token
                    Expires = DateTime.UtcNow.AddDays(5),
                    // Aquí especificamos nuestra clave y el algoritmo de firmado
                    SigningCredentials = new SigningCredentials(
                        _tokenParameters.IssuerSigningKey,
                        SecurityAlgorithms.HmacSha256Signature)
                };

                // Creamos el token y se lo devolvemos al usuario logeado
                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
                SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
                string stringToken = tokenHandler.WriteToken(token);

                return Ok(stringToken);
            }

            // Si el usuario no existe, lo indicamos
            return Unauthorized("Usuario no existe");
        }
    }
}
