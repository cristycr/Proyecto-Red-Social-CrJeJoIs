using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Posts;

namespace SocialNetwork.Services;

public class PostService
{
    private readonly UnitOfWork _unitOfWork;
    
    public PostService (UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    public async Task CreatePost(AddPostDto dto, long userId)
    {
        //Validar que haya texo en el post
        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            throw new Exception("El texto es obligatorio");
        }
        //Se crea la entidad
        var newPost = new Post
        {
            Description = dto.Description,
            Title = dto.Title,
            UserId = userId,
            CreationDate = DateTime.UtcNow
        };
        //Guardar con InsertAsync
        await _unitOfWork.PostRepository.InsertAsync(newPost);
        //Confirma los cambios en la BD
        await _unitOfWork.SaveAsync(); 
    }
}