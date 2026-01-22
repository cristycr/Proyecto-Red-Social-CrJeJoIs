using Microsoft.AspNetCore.Mvc;
// Hay que especificar el namespace de dónde se encuentra la entidad
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase {

    // Simular una base de datos
    // Debe ser static para que los valores no se reinicien con cada petición
    private static List<Post> posts = new List<Post>() {
        new Post {
            Id = 1,
            UserId = 1,
            Title = "Post uno",
            User = // ???
        }
    };

    // GET: api/posts
    [HttpGet]
    public IEnumerable<Post> Get() {
        return posts;
    }

    [HttpPost]
    // Los parámetros son la Entidad (Post) y un objeto nuevo (post) que se crea apartir del JSON que devuelve la petición POST
    public ActionResult<Post> Post([FromBody] Post post) {
        posts.Add(post);

        return Created($"/posts/{post.Id}", post);
    }
}
