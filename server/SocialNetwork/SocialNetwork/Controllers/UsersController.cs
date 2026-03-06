using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Users;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    // Inyeccion de UserRepository 
    private readonly UnitOfWork _unitOfWork;

    public UsersController(UnitOfWork unitOfWork) {
        _unitOfWork = unitOfWork;
    }

    //GET: api/users
    [HttpGet]
    public async Task<IEnumerable<GetUserDto>> GetAllUsers() {
        ICollection<User> users = await _unitOfWork.UserRepository.GetAllAsync();

        IEnumerable<GetUserDto> getUsersDto = users.Select(user => new GetUserDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!
        });
        return getUsersDto;
    }

    // Get de los usuarios seguidos y seguidores de un usuario
    [HttpGet("Followeds")]
    public async Task<IEnumerable<GetUserDto>> GetFollowedUsers(long userId) {
        ICollection<GetUserDto> users = await _unitOfWork.UserRepository.GetFollowedUsersAsync(userId);
        
        IEnumerable<GetUserDto> getUsersDto = users.Select(user => new GetUserDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!
        });
        return getUsersDto;
    }

    // metodo para obtener un usuario por su id, para mostrar su perfil
    [HttpGet("{id}/profile")]
    public async Task<GetUserProfileDto> GetUserById(long id) {
        User? user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        if (user == null) {
            throw new Exception("User not found");
        }
        GetUserProfileDto getUserCountDto = new GetUserProfileDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!,
            Biography = user.Biography,
            FollowerCount = _unitOfWork.UserRepository.GetFollowerUsersCountAsync(id).Result,
            FollowedCount = _unitOfWork.UserRepository.GetFollowedUsersCountAsync(id).Result,
        };
        return getUserCountDto;
    }

    [HttpGet("Followers")]
    public async Task<IEnumerable<GetUserDto>> GetFollowerUsers(long userId) {
        // long userId = long.Parse(User.FindFirst("id").Value);
        ICollection<GetUserDto> users = await _unitOfWork.UserRepository.GetFollowerUsersAsync(userId);

        IEnumerable<GetUserDto> getUsersDto = users.Select(user => new GetUserDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!
        });
        return getUsersDto;
    }

    // PUT
    [Authorize]
    [HttpPut]
    public async Task<User> UpdateUser([FromBody] User newUser) {
        return await _unitOfWork.UserRepository.UpdateAsync(newUser);
    }

    // DELETE
    [Authorize(Roles = "admin")]
    [HttpDelete] //Este delete es para que el admin pueda borrar usuarios, no para que un usuario pueda borrar su cuenta
                 //Para ese caso habria que hacer otro metodo
    public async Task DeleteUser([FromBody] User user) {
        await _unitOfWork.UserRepository.DeleteAsync(user);
    }
}