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
        public async Task<IEnumerable<GetFollowingDto>> GetAllFollowing() {
            ICollection<Following> following = await _unitOfWork.FollowingRepository.GetAllAsync();

            IEnumerable<GetFollowingDto> getFollowingDtos = following.Select(following => new GetFollowingDto {
                FollowerId = following.FollowerId,
                FollowedId = following.FollowedId
            });
            return getFollowingDtos;
        }

    }
}