using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Posts;
using SocialNetwork.Services; 
using System.Security.Claims; 

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase {

    // Inyección del Repositorio
    private readonly UnitOfWork _unitOfWork;
    private readonly PostService _postService;  //Variable para el servicio
    public PostsController(UnitOfWork unitOfWork, PostService postService) {
        _unitOfWork = unitOfWork;
        _postService = postService; //Se guarda el servicio
    }

    // GET: api/posts
    [HttpGet]
    public async Task<IEnumerable<GetPostDto>> GetAllPosts() {
        IEnumerable<Post> posts = await _unitOfWork.PostRepository.GetAllAsync();

        IEnumerable<GetPostDto> postsDto = posts
            .OrderByDescending(post  => post.CreationDate) //<-- El más nuevo primero
            .Select(post =>new GetPostDto() {
                Id = post.Id,
                UserId = post.UserId,
                Nickname = post.User?.Nickname,
                CreationDate = post.CreationDate,
                Title = post.Title,
                Description = post.Description
            });
        return postsDto;
    }

    // Este endpoint es para cuando un usuario entra en el perfil de otro
    // entonces verá las publicaciones concretas de ese usuario.
    // También para cuando entra en su propio perfil, para ver sus publicaciones.
    [HttpGet("by-user/{userId:long}")]
    public async Task<IEnumerable<GetPostDto>> GetPostsByUserId(long userId) {
        IEnumerable<Post> posts = await _unitOfWork.PostRepository.GetPostsByUserIdAsync(userId);

        IEnumerable<GetPostDto> postsDto = posts
            .OrderByDescending(post => post.CreationDate)
            .Select(post => new GetPostDto() {
                    Id = post.Id,
                    UserId = post.UserId,
                    Nickname = post.User?.Nickname, // <-- Aquí verás si el repo de tus compis falla
                    CreationDate = post.CreationDate,
                    Title = post.Title,
                    Description = post.Description
            });
        return postsDto;
    }

    // GET: api/posts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GetPostDto>> GetPostById(long id) {
        Post? post = await _unitOfWork.PostRepository.GetByIdAsync(id);

        if (post == null) return NotFound();

        return Ok (new GetPostDto {     // <-- Aquí no es necesario ordenar
            Id = post.Id,
            UserId = post.UserId,
            Nickname = post.User?.Nickname,
            CreationDate = post.CreationDate,
            Title = post.Title,
            Description = post.Description
        });
    }

    [Authorize] // Con esto sólo usuarios logueados pueden entrar aquí
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] AddPostDto dto)
    {
        try
        {
            // Buscar como NameIdentifier
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Si no está, buscar como "id"
            if (string.IsNullOrEmpty(userIdString))
            {
                userIdString = User.FindFirst("id")?.Value;
            }
            // Si no está, buscar como "sub"
            if (string.IsNullOrEmpty(userIdString))
            {
                userIdString = User.FindFirst("sub")?.Value;
            }

            if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out long userId))
            {
                var info = string.Join(", ", User.Claims.Select(c => c.Type));
                return Unauthorized($"No te reconozco. Tus credenciales tienen estas etiquetas: {info}");
            }

            await _postService.CreatePost(dto, userId);

            return Ok(new { message = "Publicación creada con éxito" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }

    }

    [Authorize] // Con esto sólo usuarios logueados pueden entrar aquí
    [HttpPut]
    public async Task<Post> UpdatePost([FromBody] Post newPost) {
        return await _unitOfWork.PostRepository.UpdateAsync(newPost);
    }

    [Authorize] // Con esto sólo usuarios logueados pueden entrar aquí
    [HttpDelete]
    public async Task DeletePost([FromBody] Post post) {
        await _unitOfWork.PostRepository.DeleteAsync(post);
    }

    //Endpoit para ver quien se sigue
    [HttpGet("feed")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GetPostDto>>> GetFollowedFeed()
    {
        // Extraemos el ID del Token
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("id")?.Value
                           ?? User.FindFirst("sub")?.Value;

        if (!long.TryParse(userIdString, out long currentUserId)) return Unauthorized();

        // Se solicita al repositorio los posts de los seguidos
        var posts = await _unitOfWork.PostRepository.GetFeedByFollowedUsersAsync(currentUserId);

        // Se mapea a GetPostDto 
        var result = posts.Select(p => new GetPostDto
        {
            Id = p.Id,
            UserId = p.UserId,
            Nickname = p.User.Nickname,
            CreationDate = p.CreationDate,
            Title = p.Title,
            Description = p.Description
        });

        return Ok(result);
    }
}
