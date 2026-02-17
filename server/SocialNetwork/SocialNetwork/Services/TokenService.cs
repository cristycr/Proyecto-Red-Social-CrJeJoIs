using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SocialNetwork.Models.Database.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SocialNetwork.Services
{
    public class TokenService
    {
        // Obtenemos por inyección los parámetros preestablecidos
        // para crear los token
        private readonly TokenValidationParameters _tokenParameters;

        public TokenService(IOptionsMonitor<JwtBearerOptions> jwtOptions)
        {
            _tokenParameters = jwtOptions
                .Get(JwtBearerDefaults.AuthenticationScheme)
                .TokenValidationParameters;
        }

        public string CreateToken(User user)
        {
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // Aquí añadimos los datos que sirvan para autorizar al usuario
                Claims = new Dictionary<string, object>
                {
                    { "id", user.Id.ToString() },
                    { ClaimTypes.Name, user.Nickname },
                    { ClaimTypes.Role, user.Role },
                    { "AvatarPath", user.AvatarPath },
                    { "biography", user.Biography }
                },
                // Aquí indicamos cuándo caduca el token
                Expires = DateTime.UtcNow.AddDays(5),
                // Aquí especificamos nuestra clave y el algoritmo de firmado
                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            // Creamos el token y lo devolvemos
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}