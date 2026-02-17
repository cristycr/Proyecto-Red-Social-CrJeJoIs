using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Following;
using SocialNetwork.Models.Dtos.Posts;

namespace SocialNetwork.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class FollowingController : ControllerBase {
        private readonly UnitOfWork _unitOfWork;

        // INYECCIÓN DE DEPENDENCIAS
        public FollowingController(UnitOfWork unitOfWork) {
            _unitOfWork = unitOfWork;
        }

        // PETICIÓN DE SEGUIDOS (GET)
        [HttpGet]
        public async Task<IEnumerable<FollowingDto>> GetAllFollowing() {
            ICollection<Following> following = await _unitOfWork.FollowingRepository.GetAllAsync();

            IEnumerable<FollowingDto> getFollowingDtos = following.Select(following => new FollowingDto {
                FollowerId = following.FollowerId,
                FollowedId = following.FollowedId
            });
            return getFollowingDtos;
        }

        // SEGUIR A UN USUARIO (POST)
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<FollowingDto>> AddPost([FromBody] FollowingDto dto) {

            Following following = new Following {
                FollowerId = dto.FollowerId,
                FollowedId = dto.FollowedId
            };

            await _unitOfWork.FollowingRepository.InsertAsync(following);
            bool success = await _unitOfWork.SaveAsync();

            if (!success) {
                return BadRequest(new { error = "No se pudo Seguir." });
            }

            return Ok(dto);
        }


        // DEJAR DE SEGUIR A UN USUARIO (DELETE)
        [Authorize]
        [HttpDelete]
        public async Task<ActionResult> DeleteFollowing([FromBody] FollowingDto dto) {
            Following following = new Following {
                FollowerId = dto.FollowerId,
                FollowedId = dto.FollowedId
            };

            await _unitOfWork.FollowingRepository.DeleteAsync(following);
            bool success = await _unitOfWork.SaveAsync();

            if (!success) {
                return BadRequest(new { error = "No se pudo borrar" });
            }

            return Ok(dto);
        }
    }
}