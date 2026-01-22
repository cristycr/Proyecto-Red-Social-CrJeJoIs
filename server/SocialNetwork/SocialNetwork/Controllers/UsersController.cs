using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models; //por modificar

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    //simular la base de datos con una lista en memoria
    private static List<User> users = new List<User>();

    //GET: api/users
    [HttpGet]
    public IEnumerable<User> GetAllUser() {
        return users;
    }

    // GET: api/users/{id}
    //buscar un usuario por id
    [HttpGet("{id}")]
    public ActionResult<User> GetUserById(int id) {
        User? user = users.Find(x => x.Id == id);

        return user is null ? NotFound() : user;
    }

    [HttpGet("{nickname}")]
    public ActionResult<User> GetUserByNickname(string nickname) {
        User? user = users.Find(x => x.Nickname == nickname);

        return user is null ? NotFound() : user;
    }

    [HttpGet("{email}")]
    public ActionResult<User> GetUserByEmail(string email) {
        User? user = users.Find(x => x.Email == email);

        return user is null ? NotFound() : user;
    }

    // POST: api/users
    // Insertar un nuevo usuario
    [HttpPost]
    public ActionResult<User> AddUser([FromBody] User user) {
        users.Add(user);

        return Created($"/users/{user.Id}", user);
    }

    // PUT: api/users/{id}
    // Actualizar un usuario existente
    [HttpPut("{id}")]
    public ActionResult UpdateUser(int id, [FromBody] User newUser) {
        User? oldUser = users.Find(x => x.Id == id);

        if (oldUser is not null) {
            oldUser.Email = newUser.Email;
            oldUser.Name = newUser.Name;
            oldUser.Surname1 = newUser.Surname1;
            oldUser.Password = newUser.Password;
            oldUser.Role = newUser.Role; //Solo admin puede cambiar roles
            oldUser.Surname2 = newUser.Surname2;
            oldUser.AvatarPath = newUser.AvatarPath;
            oldUser.Description = newUser.Description;
        }

        return NoContent();
    }

    // DELETE: api/users/{id}
    // Eliminar un usuario por id
    // por hacer

    [HttpDelete("{id}")]
    public void DeleteUser(int id) {
        users.RemoveAll(x => x.Id == id);
    }
}