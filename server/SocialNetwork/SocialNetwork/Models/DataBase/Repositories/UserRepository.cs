using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Repositories;

public class UserRepository : BaseRepository<User, long> {
    public UserRepository(SocialNetworkContext context) : base(context) {
    }
    public async Task<User?> GetUserByNicknameAsync(string nickname) {
        return await GetQueryable()
            .Where(u => u.Nickname == nickname)
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByEmailAsync(string email) {
        return await GetQueryable()
            .Where(u => u.Email == email)
            .FirstOrDefaultAsync();
    }
}
