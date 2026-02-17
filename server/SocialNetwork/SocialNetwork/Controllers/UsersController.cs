using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Helpers;
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

    //Get con todo para desarrollo
    [HttpGet("All")]
    public async Task<IEnumerable<GetAllUserDto>> GetAllOfUsers() {
        ICollection<User> users = await _unitOfWork.UserRepository.GetAllAsync();

        IEnumerable<GetAllUserDto> getAllUsersDto = users.Select(user => new GetAllUserDto {
            Id = user.Id,
            Email = user.Email,
            Nickname = user.Nickname,
            Name = user.Name,
            Surname1 = user.Surname1,
            Password = user.Password,
            Role = user.Role,
            Surname2 = user.Surname2,
            AvatarPath = user.AvatarPath!,
            Description = user.Description
        });
        return getAllUsersDto;
    }

    // Get de los usuarios seguidos y seguidores de un usuario
    [Authorize]
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

    [Authorize]
    [HttpGet("Followers")]
    public async Task<IEnumerable<GetUserDto>> GetFollowerUsers(long userId) {
        ICollection<GetUserDto> users = await _unitOfWork.UserRepository.GetFollowerUsersAsync(userId);

        IEnumerable<GetUserDto> getUsersDto = users.Select(user => new GetUserDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!
        });
        return getUsersDto;
    }


    // POST
    [HttpPost]
    public async Task<ActionResult<AddUserDto>> AddUser([FromBody] AddUserDto dto) {

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Datos inválidos" });
        }

        if (await _unitOfWork.UserRepository.GetUserByNicknameAsync(dto.Nickname) != null)
        {
            return BadRequest(new { error = "nickname", message = "Nickname ya en uso" });
        }

        if (await _unitOfWork.UserRepository.GetUserByEmailAsync(dto.Email) != null)
        {
            return BadRequest(new { error = "email", message = "Email ya en uso" });
        }

        User user = new User {
            Email = dto.Email,
            Nickname = dto.Nickname,
            AvatarPath = dto.AvatarPath,
            Name = dto.Name,
            Surname1 = dto.Surname1,
            Surname2 = dto.Surname2,
            Password = PasswordHelper.Hash(dto.Password)
        };

        await _unitOfWork.UserRepository.InsertAsync(user);
        bool success = await _unitOfWork.SaveAsync();

        if (!success) {
            return BadRequest(new { error = "No se pudo registrar el usuario." });
        }

        return Ok(dto);
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