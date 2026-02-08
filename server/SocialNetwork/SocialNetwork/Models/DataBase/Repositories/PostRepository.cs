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
}