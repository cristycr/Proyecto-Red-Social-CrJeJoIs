using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Repositories;

public class PostRepository : BaseRepository<Post, long> {
    public PostRepository(SocialNetworkContext context) : base(context) {
    }

    // METODO SELECT * FROM POST ================
    public async Task<ICollection<Post>> GetPostsAsync() {
        return await GetAllAsync();
    }

    // METODO SELECT BY USER ID ================
    public async Task<ICollection<Post>> GetPostsByUserIdAsync(long userId) {
        return await GetQueryable()
            .Where(post => post.UserId == userId)
            .ToArrayAsync();
    }

    // METODO SELECT BY ID ================
    public async Task<Post?> GetPostByIdAsync(long id) {
        return await GetByIdAsync(id);
    }

    // METODO INSERT ================
    public async Task<bool> AddPostAsync(Post post) {
        await InsertAsync(post);
        return await SaveAsync();
    }

    // METODO UPDATE ================
    public async Task<bool> UpdatePostAsync(Post newPost) {
        if (await ExistAsync(newPost.Id)) {
            await UpdateAsync(newPost);
            return await SaveAsync();
        } else {
            return false;
        }
    }

    // METODO DELETE ================
    public async Task<bool> DeletePostAsync(Post post) {
        if (await ExistAsync(post.Id)) {
            await DeleteAsync(post);
            return await SaveAsync();
        } else {
            return false;
        }
    }
}