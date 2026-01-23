using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    // Inyección del DbContext
    private readonly SocialNetworkContext _dbContext;

    public UsersController(SocialNetworkContext dbContext)
    {
        _dbContext = dbContext;
    }

    //GET: api/users
    [HttpGet]
    public IEnumerable<User> GetAllUsers()
    {
        return _dbContext.User.ToList();
    }

    // GET: api/users/{id}
    //buscar un usuario por id
    [HttpGet("{id:long}")]
    public ActionResult<User> GetUserById(long id)
    {
        User? user = _dbContext.User.Find(id);

        return user is null ? NotFound() : user;
    }

    [HttpGet("by-nickname/{nickname}")]
    public ActionResult<User> GetUserByNickname(string nickname)
    {
        User? user = _dbContext.User.Find(nickname);

        return user is null ? NotFound() : user;
    }

    [HttpGet("by-email/{email}")]
    public ActionResult<User> GetUserByEmail(string email)
    {
        User? user = _dbContext.User.Find(email);

        return user is null ? NotFound() : user;
    }

    // POST: api/users
    // Insertar un nuevo usuario
    [HttpPost]
    public ActionResult<User> AddUser([FromBody] User user)
    {
        _dbContext.User.Add(user);
        _dbContext.SaveChanges();

        return Created($"/users/{user.Id}", user);
    }

    // PUT: api/users/{id}
    // Actualizar un usuario existente
    [HttpPut("{id}")]
    public ActionResult UpdateUser(long id, [FromBody] User newUser)
    {
        User? oldUser = _dbContext.User.Find(id);

        if (oldUser is not null)
        {
            oldUser.Email = newUser.Email;
            oldUser.Name = newUser.Name;
            oldUser.Surname1 = newUser.Surname1;
            oldUser.Password = newUser.Password;
            oldUser.Role = newUser.Role; //Solo admin puede cambiar roles
            oldUser.Surname2 = newUser.Surname2;
            oldUser.AvatarPath = newUser.AvatarPath;
            oldUser.Description = newUser.Description;

            _dbContext.SaveChanges();
        }

        return NoContent();
    }

    // DELETE: api/users/{id}
    // Eliminar un usuario por id
    [HttpDelete("{id:long}")]
    public void DeleteUser(long id)
    {
        User? user = _dbContext.User.Find(id);
        if (user is not null)
        {
            _dbContext.User.Remove(user);
            _dbContext.SaveChanges();
        }
    }
}