using Microsoft.AspNetCore.Mvc;
// Hay que especificar el namespace de dónde se encuentra la entidad
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase {

    // Simular una base de datos
    // Debe ser static para que los valores no se reinicien con cada petición
    private static List<Post> posts = new List<Post>();

    // GET: api/posts
    [HttpGet]
    public IEnumerable<Post> Get() {
        return posts;
    }

    // GET: api/posts/
    [HttpGet("{id}")]
    public ActionResult<Post> Get(long id) {
        Post? post = posts.Find(x => x.Id == id);

        return post is null ? NotFound() : post;
    }

    [HttpPost]
    // Los parámetros son la Entidad (Post) y un objeto nuevo (post) que se crea apartir del JSON que devuelve la petición POST
    public void Post([FromBody] Post post) {
        posts.Add(post);
    }

    [HttpPut("{id}")]

    public ActionResult Put(int id, [FromBody] Post newPost) {
        Post? oldPost = posts.Find(x => x.Id == id);

        if (oldPost is not null) {
            oldPost.Id = newPost.Id;
            oldPost.Title = newPost.Title;
            oldPost.Description = newPost.Description;
            oldPost.PicturePath = newPost.PicturePath;
        }

        return NoContent();
    }
}
