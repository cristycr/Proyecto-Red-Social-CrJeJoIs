using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models;                         // Para acceder a la clase User
using SocialNetwork.Models.DataBase.Repositories;   // Para acceder a  Repositorio
using System.Threading.Tasks;

namespace SocialNetwork.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowingController : ControllerBase
    {
        // Se pide el Repositorio.
        private readonly FollowingRepository _repository;

        // INYECCIÓN DE DEPENDENCIAS ==========================================================================
        // Repositorio listo para usar al arrancar.
        public FollowingController(FollowingRepository repository)
        {
            _repository = repository;
        }

        // PETICIÓN DE SEGUIDOS (GET) =========================================================================
        [HttpGet("seguidos/{userId}")]
        public async Task<IActionResult> GetFolloweds(long userId)
        {
            // Se llama al método del repositorio
            var lista = await _repository.GetFolloweds(userId);

            // Devuelve la lista (Código 200 OK)
            return Ok(lista);
        }

        // PETICIÓN DE SEGUIDORES (GET) =======================================================================
        [HttpGet("seguidores/{userId}")]
        public async Task<IActionResult> GetFollowers(long userId)
        {
            var lista = await _repository.GetFollowers(userId);
            return Ok(lista);
        }

        // PETICIÓN DE SEGUIMIENTO (POST) =====================================================================
        [HttpPost]
        public async Task<IActionResult> Follow([FromBody] FollowRequest request)
        {
            // Llamada a la lógica del repositorio
            bool result = await _repository.CreateFolloging(request.IdFollower, request.IdFollowed);

            if (result)
            {
                return Ok("¡Seguimiento creado con éxito!");
            }
            else
            {
                return BadRequest("Error: No se pudo seguir (quizás ya lo sigues o es el mismo usuario).");
            }
        }

        // PETICIÓN DE DEJAR DE SEGUIR (DELETE) ===============================================================
        // Se pasan los datos por la URL porque es un DELETE
        [HttpDelete("{idFollower}/{idFollowed}")]
        public async Task<IActionResult> Unfollow(long idFollower, long idFollowed)
        {
            bool result = await _repository.DeleteFollowing(idFollower, idFollowed);

            if (result)
            {
                return Ok("Has dejado de seguir al usuario.");
            }
            else
            {
                return NotFound("No se encontró ese seguimiento.");
            }
        }
    }

    // CLASE AUXILIAR =========================================================================================
    // Sirve solo para recibir los datos del JSON en el POST de forma limpia
    public class FollowRequest
    {
        public long IdFollower { get; set; }
        public long IdFollowed { get; set; }
    }
}