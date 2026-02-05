using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;

namespace SocialNetwork.Models.Database.Repositories;

public class UserRepository : BaseRepository<User, long> {
    public UserRepository(SocialNetworkContext context) : base(context) {
    }

    public async Task<ICollection<User>> GetUserAsync() {
        return await GetAllAsync();
    }
    public async Task<User?> GetUserByIdAsync(long id) {
        return await GetByIdAsync(id);
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


    public async Task AddUserAsync(User user) {
        await InsertAsync(user);
    }

    public async Task<bool> UpdateUserAsync(User user) {
        if (await ExistAsync(user.Id)) {
            await UpdateAsync(user);
            return true;
        } else {
            return false;
        }
    }

    public async Task<bool> DeleteUserAsync(User user) {
        if (await ExistAsync(user.Id)) {
            await DeleteAsync(user);
            return true;
        } else {
            return false;
        }
    }
}
