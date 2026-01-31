using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;

// Hay que especificar el namespace de dónde se encuentra la entidad
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Database.Repositories;

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
    public async Task<IEnumerable<Post>> GetAllPosts() {
        return await _unitOfWork.PostRepository.GetPostsAsync();
    }

    // GET: api/posts/by-user/5
    [HttpGet("by-user/{userId:long}")]
    public async Task<IEnumerable<Post>> GetPostsByUserId(long userId) {
        return await _unitOfWork.PostRepository.GetPostsByUserIdAsync(userId);
    }

    // GET: api/posts/5
    [HttpGet("{id}")]
    public async Task<Post?> GetPostById(long id) {
        return await _unitOfWork.PostRepository.GetPostByIdAsync(id);
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
