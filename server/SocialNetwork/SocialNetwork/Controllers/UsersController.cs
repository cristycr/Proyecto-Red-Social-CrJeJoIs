using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialNetwork.Helpers;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Users;
using SocialNetwork.Services;
using System.Security.Claims;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    // Inyeccion de UserRepository 
    private readonly UnitOfWork _unitOfWork;
    private readonly IFileService _fileService;

    public UsersController(UnitOfWork unitOfWork, IFileService fileService) {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
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

    [Authorize]
    [HttpGet("all")]
    public async Task<GetUserProfileExtendDto> GetProfileUsers(long userId) {
        User? user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        if (user == null) throw new Exception("User not found");

        var dto = new GetUserProfileExtendDto {
            Email = user.Email,
            Name = user.Name,
            Surname1 = user.Surname1,
            Surname2 = user.Surname2,
            Biography = user.Biography
        };

        return dto;
    }

    // Get de los usuarios seguidos y seguidores de un usuario
    [HttpGet("Followeds")]
    public async Task<IEnumerable<GetFollowDto>> GetFollowedUsers(long userId) {
        ICollection<GetFollowDto> users = await _unitOfWork.UserRepository.GetFollowedUsersAsync(userId);

        IEnumerable<GetFollowDto> getFollowDto = users.Select(user => new GetFollowDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!,
            Name = user.Name,
            Surname1 = user.Surname1,
            Surname2 = user.Surname2
        });
        return getFollowDto;
    }

    [HttpGet("Followers")]
    public async Task<IEnumerable<GetFollowDto>> GetFollowerUsers(long userId) {
        // long userId = long.Parse(User.FindFirst("id").Value);
        ICollection<GetFollowDto> users = await _unitOfWork.UserRepository.GetFollowerUsersAsync(userId);

        IEnumerable<GetFollowDto> getFollowDto = users.Select(user => new GetFollowDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!,
            Name = user.Name,
            Surname1 = user.Surname1,
            Surname2 = user.Surname2
        });
        return getFollowDto;
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

    // PUT
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] PutUserDto dto) {

        User? user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        if (user == null) {
            return NotFound();
        }

        // Comprobar que el email no está en uso por otro usuario
        User? userWithEmail = await _unitOfWork.UserRepository.GetUserByEmailAsync(dto.Email);
        if (userWithEmail != null && userWithEmail.Id != id) {
            return BadRequest("email");
        }
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname1 = dto.Surname1;
        user.Surname2 = dto.Surname2;
        user.Biography = dto.Biography;
        await _unitOfWork.UserRepository.UpdateAsync(user);
        bool success = await _unitOfWork.SaveAsync();
        if (!success) {
            return BadRequest();
        }
        return Ok(dto);
    }

    [Authorize]
    [HttpPut("Password")]
    public async Task<IActionResult> UpdatePassword(int id, [FromBody] PutPasswordDto dto) {

        User? user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        if (user == null) {
            return NotFound();
        }
        user.Password = PasswordHelper.Hash(dto.Password);
        await _unitOfWork.UserRepository.UpdateAsync(user);
        bool success = await _unitOfWork.SaveAsync();
        if (!success) {
            return BadRequest();
        }
        return Ok(dto);
    }

    // POST
    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        long userId = long.Parse(User.FindFirst("id")!.Value);

        User? user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound();

        if (!string.IsNullOrEmpty(user.AvatarPath))
            await _fileService.DeleteFileAsync(user.AvatarPath);

        var result = await _fileService.SaveFileAsync(file);

        user.AvatarPath = result.FileName;
        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveAsync();

        // Devuelve URL completa al frontend
        return Ok(new { avatarUrl = result.Url });
    }


    // DELETE
    [Authorize]
    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar()
    {
        long userId = long.Parse(User.FindFirst("id")!.Value);

        User? user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound();

        if (string.IsNullOrEmpty(user.AvatarPath))
            return BadRequest("El usuario no tiene avatar.");

        await _fileService.DeleteFileAsync(user.AvatarPath);

        user.AvatarPath = null;

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveAsync();

        return NoContent();
    }
}