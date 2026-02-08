using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models;                         // Para acceder a la clase User
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Dtos;
using SocialNetwork.Models.Dtos.Following;
using System.Threading.Tasks;

namespace SocialNetwork.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowingController : ControllerBase
    {
        // Se cambia la variable privada del repositorio a UnitOfWork
        private readonly UnitOfWork _unitOfWork;

        // INYECCIÓN DE DEPENDENCIAS ==========================================================================
        // Se cambia también el Constructor a UnitOfWork
        public FollowingController(UnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // PETICIÓN DE SEGUIDOS (GET) =========================================================================
        [HttpGet("followeds/{userId:long}")]
        public async Task<IActionResult> GetFolloweds(long userId)
        {
            // Se llama al método del repositorio
            var lista = await _unitOfWork.FollowingRepository.GetFolloweds(userId);

            var dtoList = lista.Select(u => new FollowingDto
            {
                Id = u.Id,
                Name = u.Name,
                Nickname = u.Nickname,
                Surname1 = u.Surname1,
                AvatarPath = u.AvatarPath
            }).ToList();

            // Devuelve la lista (Código 200 OK)
            return Ok(dtoList);
        }

        // PETICIÓN DE SEGUIDORES (GET) =======================================================================
        [HttpGet("followers/{userId}")]
        public async Task<IActionResult> GetFollowers(long userId)
        {
            var lista = await _unitOfWork.FollowingRepository.GetFollowers(userId);

            var dtoList = lista.Select(u => new FollowingDto
            {
                Id = u.Id,
                Nickname = u.Nickname,
                Name = u.Name,
                Surname1 = u.Surname1,
                AvatarPath = u.AvatarPath
            }).ToList();

            return Ok(dtoList);
        }

        // PETICIÓN DE SEGUIMIENTO (POST) =====================================================================
        [HttpPost]
        public async Task<IActionResult> Follow([FromBody] CreateFollowingDto request)
        {
            // Llamada a la lógica del repositorio pero a través del UOW
            bool result = await _unitOfWork.FollowingRepository.CreateFollowing(request.FollowerId, request.FollowedId);

            if (!result)
            {
                return BadRequest("No se pudo crear el seguimiento.");
            }

            await _unitOfWork.SaveAsync();

            return Ok("Seguimiento creado con éxito.");
        }

        // PETICIÓN DE DEJAR DE SEGUIR (DELETE) ===============================================================
        // Se pasan los datos por la URL porque es un DELETE
        [HttpDelete("{idFollower}/{idFollowed}")]
        public async Task<IActionResult> Unfollow(long idFollower, long idFollowed)
        {
            bool result = await _unitOfWork.FollowingRepository.DeleteFollowing(idFollower, idFollowed);

            if (!result)
            {
                return NotFound("No se encontró ese seguimiento.");
            }
            await _unitOfWork.SaveAsync();

            return Ok("Has dejado de seguir al usuario.");
        }

        // CLASE AUXILIAR eliminada, ya que se usa el DTO
       
    }
}