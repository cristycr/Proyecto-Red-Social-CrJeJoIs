using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Posts;

namespace SocialNetwork.Models.Database.Repositories;

public class PostRepository : BaseRepository<Post, long> {
    public PostRepository(SocialNetworkContext context) : base(context) {
    }

    // METODO SELECT BY USER ID ================
    public async Task<ICollection<Post>> GetPostsByUserIdAsync(long userId) {
        return await GetQueryable()
            .Where(post => post.UserId == userId)
            .OrderByDescending(post => post.CreationDate)
            .ToArrayAsync();
    }

    // Metodo ordenado por fecha de creación DESCENDENTE
    public async Task<ICollection<GetPostUserDto>> GetPostsByCreationDateAsync() {
        return await GetQueryable()
            .Include(post => post.User)
            .OrderByDescending(post => post.CreationDate)
            .Select(post  => new GetPostUserDto {
                Id = post.Id,
                UserId = post.UserId,
                CreationDate = post.CreationDate,
                Title = post.Title!,
                Description = post.Description!,
                Nickname = post.User!.Nickname,
                AvatarPath = post.User.AvatarPath
            })
            .ToArrayAsync();
    }

    //Metodo ordenado por fecha de creación DESCENDENTE, pero solo de los usuarios que sigo
    public async Task<ICollection<GetPostUserDto>> GetPostsByCreationDateLoginAsync(long userId)
    {
        return await GetQueryable()
            .Include(post => post.User)
            .Where(post =>
                _dbContext.Following.Any(f =>
                    f.FollowerId == userId &&
                    f.FollowedId == post.UserId
                )
            )
            .OrderByDescending(post => post.CreationDate)
            .Select(post => new GetPostUserDto
            {
                Id = post.Id,
                UserId = post.UserId,
                CreationDate = post.CreationDate,
                Title = post.Title!,
                Description = post.Description!,
                Nickname = post.User!.Nickname,
                AvatarPath = post.User.AvatarPath
            })
            .ToArrayAsync();
    }
}