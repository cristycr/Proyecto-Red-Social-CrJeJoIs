using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;

// Hay que especificar el namespace de dónde se encuentra la entidad
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Database.Repositories;
using SocialNetwork.Models.Dtos.Posts;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase {

    // Inyección del Repositorio
    private readonly UnitOfWork _unitOfWork;
    public PostsController(UnitOfWork unitOfWork) {
        _unitOfWork = unitOfWork;
    }

    // GET: api/posts
    [HttpGet]
    public async Task<IEnumerable<GetPostDto>> GetAllPosts() {
        IEnumerable<Post> posts = await _unitOfWork.PostRepository.GetPostsAsync();

        IEnumerable<GetPostDto> postsDto = posts.Select(post =>
        new GetPostDto() {
            Id = post.Id,
            UserId = post.UserId,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description,
            PicturePath = post.PicturePath
        });

        return postsDto;
    }

    // Este endpoint es para cuando un usuario entra en el perfil de otro
    // entonces verá las publicaciones concretas de ese usuario.
    // También para cuando entra en su propio perfil, para ver sus publicaciones.
    [HttpGet("by-user/{userId:long}")]
    public async Task<IEnumerable<GetPostDto>> GetPostsByUserId(long userId) {
        
        IEnumerable<Post> posts = await _unitOfWork.PostRepository.GetPostsByUserIdAsync(userId);

        IEnumerable<GetPostDto> postsDto = posts.Select(post =>
        new GetPostDto() {
            Id = post.Id,
            UserId = post.UserId,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description,
            PicturePath = post.PicturePath
        });

        return postsDto;
    }

    // GET: api/posts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GetPostDto>> GetPostById(long id) {
        Post? post = await _unitOfWork.PostRepository.GetPostByIdAsync(id);

        if (post == null)
            return NotFound();

        GetPostDto postDto = new GetPostDto {
            Id = post.Id,
            UserId = post.UserId,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description,
            PicturePath = post.PicturePath
        };

        return Ok(postDto);
    }

    [HttpPost]
    // Los parámetros son la Entidad (Post) y un objeto nuevo (post) que se crea
    // apartir del JSON que devuelve la petición POST
    public async Task<bool> AddPost([FromBody] Post post) {
        return await _unitOfWork.PostRepository.AddPostAsync(post);
    }
    
    [HttpPut]
    public async Task<bool> UpdatePost([FromBody] Post newPost) {
        return await _unitOfWork.PostRepository.UpdatePostAsync(newPost);
    }

    [HttpDelete]
    public async Task<bool> DeletePost([FromBody] Post post) {
        return await _unitOfWork.PostRepository.DeletePostAsync(post);
    }
}
