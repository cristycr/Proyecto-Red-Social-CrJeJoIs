using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;

// Hay que especificar el namespace de dónde se encuentra la entidad
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase {

    // Inyección del DbContext
    private readonly SocialNetworkContext _dbContext;
    public PostsController(SocialNetworkContext dbContext) {
        _dbContext = dbContext;
    }

    // GET: api/posts
    [HttpGet]
    public IEnumerable<Post> GetAllPosts() {
        return _dbContext.Post.ToList();
    }

    // GET: api/posts/by-user/5
    [HttpGet("by-user/{userId:long}")]
    public List<Post> GetPostsByUserId(long userId) {
        List<Post>? userPosts = _dbContext.Post.Where(x => x.UserId == userId).ToList();

        return userPosts;
    }

    // GET: api/posts/5
    [HttpGet("{id}")]
    public ActionResult<Post> GetPostById(long id) {
        Post? post = _dbContext.Post.Find(id);

        return post is null ? NotFound() : post;
    }

    [HttpPost]
    // Los parámetros son la Entidad (Post) y un objeto nuevo (post) que se crea
    // apartir del JSON que devuelve la petición POST
    public ActionResult<Post> AddPost([FromBody] Post post) {
        _dbContext.Post.Add(post);
        _dbContext.SaveChanges();

        return Created($"/posts/{post.Id}", post);
    }

    [HttpPut("{id}")]
    public ActionResult UpdatePost(long id, [FromBody] Post newPost) {
        Post? oldPost = _dbContext.Post.Find(id);

        if (oldPost is not null) {
            oldPost.Title = newPost.Title;
            oldPost.Description = newPost.Description;
            oldPost.PicturePath = newPost.PicturePath;

            _dbContext.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public void DeletePost(long id) {
        Post? post = _dbContext.Post.Find(id);

        if (post is not null) {
            _dbContext.Post.Remove(post);
            _dbContext.SaveChanges();
        }
    }
}
