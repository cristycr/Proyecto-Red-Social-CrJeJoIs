using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Following;
using System.Text.Json;

namespace SocialNetwork.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowingController : ControllerBase
    {
        private readonly UnitOfWork _unitOfWork;
        private readonly WebSocketManager _webSocketManager;

        // INYECCIÓN DE DEPENDENCIAS
        public FollowingController(UnitOfWork unitOfWork, WebSocketManager webSocketManager)
        {
            _unitOfWork = unitOfWork;
            _webSocketManager = webSocketManager;
        }

        // PETICIÓN DE SEGUIDOS (GET)
        [HttpGet]
        public async Task<IEnumerable<FollowingDto>> GetAllFollowing()
        {
            ICollection<Following> following = await _unitOfWork.FollowingRepository.GetAllAsync();

            IEnumerable<FollowingDto> getFollowingDtos = following.Select(f => new FollowingDto
            {
                FollowerId = f.FollowerId,
                FollowedId = f.FollowedId
            });

            return getFollowingDtos;
        }

        // SEGUIR A UN USUARIO (POST)
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<FollowingDto>> AddPost([FromBody] FollowingDto dto)
        {
            var followerNickname = User.Identity!.Name!;
            var followerAvatarFileName = User.FindFirst("AvatarPath")?.Value;
            var followerAvatarUrl = string.IsNullOrEmpty(followerAvatarFileName)
                ? null
                : $"/uploads/{followerAvatarFileName}";

            Following following = new Following
            {
                FollowerId = dto.FollowerId,
                FollowedId = dto.FollowedId
            };

            await _unitOfWork.FollowingRepository.InsertAsync(following);
            bool success = await _unitOfWork.SaveAsync();

            if (!success)
            {
                return BadRequest(new { error = "No se pudo seguir." });
            }

            await _webSocketManager.SendMessage(
                dto.FollowedId.ToString(),
                JsonSerializer.Serialize(new
                {
                    type = "new_follower",
                    payload = new
                    {
                        followerId = dto.FollowerId,
                        nickname = followerNickname,
                        avatar = followerAvatarUrl
                    }
                })
            );

            return Ok(dto);
        }

        // DEJAR DE SEGUIR A UN USUARIO (DELETE)
        [Authorize]
        [HttpDelete]
        public async Task<ActionResult> DeleteFollowing([FromBody] FollowingDto dto)
        {
            var followerNickname = User.Identity!.Name!;
            var followerAvatarFileName = User.FindFirst("AvatarPath")?.Value;
            var followerAvatarUrl = string.IsNullOrEmpty(followerAvatarFileName)
                ? null
                : $"/uploads/{followerAvatarFileName}";

            Following following = new Following
            {
                FollowerId = dto.FollowerId,
                FollowedId = dto.FollowedId
            };

            await _unitOfWork.FollowingRepository.DeleteAsync(following);
            bool success = await _unitOfWork.SaveAsync();

            if (!success)
            {
                return BadRequest(new { error = "No se pudo borrar." });
            }

            await _webSocketManager.SendMessage(
                dto.FollowedId.ToString(),
                JsonSerializer.Serialize(new
                {
                    type = "lost_follower",
                    payload = new
                    {
                        followerId = dto.FollowerId,
                        nickname = followerNickname,
                        avatar = followerAvatarUrl
                    }
                })
            );

            return Ok(dto);
        }
    }
}