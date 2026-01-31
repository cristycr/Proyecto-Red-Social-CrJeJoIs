using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Database.Repositories;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    // Inyección de UserRepository 
    private readonly UnitOfWork _unitOfWork;

    public UsersController(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    //GET: api/users
    [HttpGet]
    public async Task<IEnumerable<User>> GetAllUsers(){
        return await _unitOfWork.UserRepository.GetUserAsync();
    }

    // GET
    [HttpGet("{id:long}")]
    public async Task<User?> GetUserById(long id)
    {
        return await _unitOfWork.UserRepository.GetUserByIdAsync(id);
    }

    // Get by nickname
    [HttpGet("by-nickname/{nickname}")]
    public async Task<User?> GetUserByNickname(string nickname)
    {
        return await _unitOfWork.UserRepository.GetUserByNicknameAsync(nickname);
    }

    // Get by email
    [HttpGet("by-email/{email}")]
    public async Task<User?> GetUserByEmail(string email)
    {
        return await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
    }

    // POST
    [HttpPost]
    public async Task<bool> AddUser([FromBody] User user)
    {
        return await _unitOfWork.UserRepository.AddUserAsync(user);
    }

    // PUT
    [HttpPut]
    public async Task<bool> UpdateUser([FromBody] User newUser)
    {
        return await _unitOfWork.UserRepository.UpdateUserAsync(newUser);
    }

    // DELETE
    [HttpDelete]
    public async Task<bool> DeleteUser([FromBody] User user)
    {
        return await _unitOfWork.UserRepository.DeleteUserAsync(user);
    }
}