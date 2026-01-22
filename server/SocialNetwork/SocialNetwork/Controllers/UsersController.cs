using Microsoft.AspNetCore.Http;
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
    public IEnumerable<User> Get() {
        return users;
    }

    // GET: api/users/{id}
    //buscar un usuario por id
    [HttpGet("{id}")]
    public ActionResult<User> Get(int id) {
        User? user = users.Find(x => x.Id == id);

        return user is null ? NotFound() : user;
    }

    // POST: api/users
    // Insertar un nuevo usuario
    [HttpPost]
    public ActionResult<User> Post([FromBody] User user) {
        users.Add(user);

        return Created($"/users/{user.Id}", user);
    }

    // PUT: api/users/{id}
    // Actualizar un usuario existente
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] User newUser) {
        User? oldUser = users.Find(x => x.Id == id);

        if (oldUser is not null) {
            oldUser.Id = newUser.Id;
            //... actualizar el resto de propiedades
        }

        return NoContent();
    }

    // DELETE: api/users/{id}
    // Eliminar un usuario por id
    // por hacer
}