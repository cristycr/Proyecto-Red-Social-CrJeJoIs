using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Following;

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

    }
}