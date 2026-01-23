using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Services;
using SocialNetwork.Models;
using System.Security.Claims;

namespace SocialNetwork.Controllers
{
    // CONFIGURACION
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class FollowingController : ControllerBase
    {
        // CONEXIÓN CON EL SERVIDOR
        private readonly FollowingService _followingService;

        public FollowingController(FollowingService followingService)   //CONSTRUCTOR
        {                                                               //Cuando hay una petición, busca el FollowinService
            _followingService = followingService;
        }
        // ENDPOINT PARA SEGUIR (POST)
        [HttpPost("{userId}")]
        public async Task<IActionResult> Follow(long userId)
        {
            // Obtenemos el ID del usuario que está haciendo la petición (el que está logueado)
            var currentUserId = GetCurrentUserId();

            if (currentUserId == -1) 
                return Unauthorized("No se pudo identificar al usuario.");

            // Llamamos al servicio
            var resultado = await _followingService.SeguirAsync(currentUserId, userId);
           
            if (resultado)
            {
                return Ok(new { message = "Usuario seguido correctamente." });
            }
            else
            {
            // Si devuelve false, es porque ya lo seguía o hubo un error lógico
            return BadRequest("No se pudo seguir al usuario (quizás ya lo sigues o intentas seguirte a ti mismo).");
            }
        }

        // ENDPOINT PARA DEJAR DE SEGUIR (DELETE)
        // Se llamará como: DELETE api/following/{idUsuarioADejarDeSeguir}
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Unfollow(long userId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == -1)
                return Unauthorized("No se pudo identificar al usuario.");

            // Llamamos al servicio
            var resultado = await _followingService.DejarDeSeguirAsync(currentUserId, userId);

            if (resultado)
            {
                return Ok(new { message = "Se ha dejado de seguir al usuario." });
            }
            else
            {
                return NotFound("No se encontró la relación de seguimiento o no se pudo eliminar.");
            }
        }

        // MÉTODO AUXILIAR PARA OBTENER EL ID DEL USUARIO ACTUAL
        private long GetCurrentUserId()
        {
            // Buscamos el "Claim" que tiene el ID del usuario en el token
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                var userClaim = identity.FindFirst(ClaimTypes.NameIdentifier); // O el nombre que uséis para el ID
                if (userClaim != null && long.TryParse(userClaim.Value, out long id))
                {
                    return id;
                }
            }
            return -1; // Retornamos -1 si no encontramos al usuario
        }
    }
}