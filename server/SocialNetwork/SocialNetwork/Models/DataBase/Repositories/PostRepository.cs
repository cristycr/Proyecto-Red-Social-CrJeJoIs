using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Repositories;

public class PostRepository : BaseRepository<Post, long> {
    private readonly SocialNetworkContext _context;

    public PostRepository(SocialNetworkContext context) : base(context) {
    }
    public async Task<IEnumerable<Post>> GetFeedByFollowedUsersAsync(long currentUserId)
    {
        // Busca los IDs de los usuarios a la que sigue el actual
        var followedUserIds = await _context.Following
            .Where(f => f.IdFollower == currentUserId)
            .Select(f => f.IdFollowed)
            .ToListAsync();

        return await GetQueryable()
            .Include(p => p.User) 
            .Where(p => followedUserIds.Contains(p.UserId))
            .OrderByDescending(p => p.CreationDate)
            .ToListAsync();
    }

    // METODO SELECT BY USER ID ================
    public async Task<ICollection<Post>> GetPostsByUserIdAsync(long userId) {
        return await GetQueryable()
            .Include(post => post.User)     //<-- carga los datos del autor
            .Where(post => post.UserId == userId)
            .OrderByDescending(p => p.CreationDate)
            .ToArrayAsync();
    }
}