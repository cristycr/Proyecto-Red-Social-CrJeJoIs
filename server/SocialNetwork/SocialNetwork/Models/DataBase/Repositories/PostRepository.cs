using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Repositories;

public class PostRepository : BaseRepository<Post, long> {
    public PostRepository(SocialNetworkContext context) : base(context) {
    }

    // METODO SELECT BY USER ID ================
    public async Task<ICollection<Post>> GetPostsByUserIdAsync(long userId) {
        return await GetQueryable()
            .Where(post => post.UserId == userId)
            .ToArrayAsync();
    }

    // Metodo ordenado por fecha de creación DESCENDENTE
    public async Task<ICollection<Post>> GetPostsByCreationDateAsync() {
        return await GetQueryable()
            .OrderByDescending(post => post.CreationDate)
            .ToArrayAsync();
    }

    public async Task<ICollection<Post>> GetPostsByCreationDateLoginAsync(long userId) {
        return await GetQueryable()
            .Join(
                    _dbContext.Following,
                    post => post.UserId,
                    f => f.FollowedId,
                    (post, f) => new { post, f }
                )
            .Where(x => x.f.FollowerId == userId)
            .Select(x => x.post)
            .OrderByDescending(p => p.CreationDate)
            .ToArrayAsync();
    }
}