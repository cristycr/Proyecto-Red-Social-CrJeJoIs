using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Users;
using SocialNetwork.Services;

namespace SocialNetwork.Controllers; 
[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase {
    // Inyeccion de UserRepository 
    private readonly UnitOfWork _unitOfWork;
    private readonly IFileService _fileService;

    public AdminController(UnitOfWork unitOfWork, IFileService fileService) {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
    }

    //GET: api/users
    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IEnumerable<GetAdminDto>> GetAllUsers() {
        ICollection<User> users = await _unitOfWork.UserRepository.GetAllAsync();

        IEnumerable<GetAdminDto> getUsersDto = users.Select(user => new GetAdminDto {
            Id = user.Id,
            Nickname = user.Nickname,
            AvatarPath = user.AvatarPath!,
            Email = user.Email,
            Role = user.Role
        });
        return getUsersDto;
    }

    //PUT: api/admin
    [Authorize(Roles = "admin")]
    [HttpPut("{id}Role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] PutUserRoleDto dto) {

        User? user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        if (user == null) {
            return NotFound();
        }
        user.Role = dto.Role;
        await _unitOfWork.UserRepository.UpdateAsync(user);
        bool success = await _unitOfWork.SaveAsync();
        if (!success) {
            return BadRequest();
        }
        return Ok(dto);
    }

    //DELETE: api/admin
    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")] //Este delete es para que el admin pueda borrar usuarios, no para que un usuario pueda borrar su cuenta
    public async Task<IActionResult> DeleteUser(int id) {
        User? user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        if (user == null) {
            return NotFound();
        }
        await _unitOfWork.UserRepository.DeleteAsync(user);
        bool success = await _unitOfWork.SaveAsync();
        if (!success) {
            return BadRequest();
        }
        return Ok();
    }
}
