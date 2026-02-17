using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
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
    public async Task<IEnumerable<GetPostUserDto>> GetAllPostsOrderBy() {
        IEnumerable<GetPostUserDto> posts = await _unitOfWork.PostRepository.GetPostsByCreationDateAsync();

        IEnumerable<GetPostUserDto> postsDto = posts.Select(post =>
        new GetPostUserDto() {
            Id = post.Id,
            UserId = post.UserId,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description,
            Nickname = post.Nickname,
            AvatarPath = post.AvatarPath
        });

        return postsDto;
    }

    // GET: api/posts/login
    [Authorize]
    [HttpGet("login")]
    public async Task<IEnumerable<GetPostUserDto>> GetAllPostsOrderByLogin(long userId) {
        IEnumerable<GetPostUserDto> posts = await _unitOfWork.PostRepository.GetPostsByCreationDateLoginAsync(userId);

        IEnumerable<GetPostUserDto> postsDto = posts.Select(post =>
        new GetPostUserDto() {
            Id = post.Id,
            UserId = post.UserId,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description,
            Nickname = post.Nickname,
            AvatarPath = post.AvatarPath
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
            Description = post.Description
        });
        return postsDto;
    }

    [HttpPost]
    // Los parámetros son la Entidad (Post) y un objeto nuevo (post) que se crea
    // apartir del JSON que devuelve la petición POST
    public async Task<Post> AddPost([FromBody] Post post) {
        return await _unitOfWork.PostRepository.InsertAsync(post);
    }

    [HttpPut]
    public async Task<Post> UpdatePost([FromBody] Post newPost) {
        return await _unitOfWork.PostRepository.UpdateAsync(newPost);
    }

    [HttpDelete]
    public async Task DeletePost([FromBody] Post post) {
        await _unitOfWork.PostRepository.DeleteAsync(post);
    }
}
