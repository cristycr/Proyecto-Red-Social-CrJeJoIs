using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.DataBase.Repositories;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    // Inyección de UserRepository 
    private readonly UserRepository _userRepository;

    public UsersController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    //GET: api/users
    [HttpGet]
    public async Task<IEnumerable<User>> GetAllUsers(){
        return await _userRepository.GetUserAsync();
    }

    // GET
    [HttpGet("{id:long}")]
    public async Task<User?> GetUserById(long id)
    {
        return await _userRepository.GetUserByIdAsync(id);
    }

    // Get by nickname
    [HttpGet("by-nickname/{nickname}")]
    public async Task<User?> GetUserByNickname(string nickname)
    {
        return await _userRepository.GetUserByNicknameAsync(nickname);
    }

    // Get by email
    [HttpGet("by-email/{email}")]
    public async Task<User?> GetUserByEmail(string email)
    {
        return await _userRepository.GetUserByEmailAsync(email);
    }

    // POST
    [HttpPost]
    public async Task<bool> AddUser([FromBody] User user)
    {
        return await _userRepository.AddUserAsync(user);
    }

    // PUT
    [HttpPut]
    public async Task<bool> UpdateUser([FromBody] User newUser)
    {
        return await _userRepository.UpdateUserAsync(newUser);
    }

    // DELETE
    [HttpDelete]
    public async Task<bool> DeleteUser([FromBody] User user)
    {
        return await _userRepository.DeleteUserAsync(user);
    }
}