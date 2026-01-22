using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.DataBase;
using SocialNetwork.Models.DataBase.Entities;

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
    public IEnumerable<User> GetAllUser()
    {
        return _dbContext.User.ToList();
    }

    // GET: api/users/{id}
    //buscar un usuario por id
    [HttpGet("{id}")]
    public ActionResult<User> GetUserById(int id)
    {
        User? user = _dbContext.User.Find(id);

        return user is null ? NotFound() : user;
    }

    [HttpGet("{nickname}")]
    public ActionResult<User> GetUserByNickname(string nickname)
    {
        User? user = _dbContext.User.FirstOrDefault(u => u.Nickname == nickname);

        return user is null ? NotFound() : user;
    }

    [HttpGet("{email}")]
    public ActionResult<User> GetUserByEmail(string email)
    {
        User? user = _dbContext.User.FirstOrDefault(u => u.Email == email);

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
    public ActionResult UpdateUser(int id, [FromBody] User newUser)
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
    [HttpDelete("{id}")]
    public void DeleteUser(int id)
    {
        var user = _dbContext.User.Find(id);
        if (user is not null)
        {
            _dbContext.User.Remove(user);
            _dbContext.SaveChanges();
        }
    }
}