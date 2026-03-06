using Microsoft.EntityFrameworkCore;
using SocialNetwork.Models.Database.Entities;
using SocialNetwork.Models.Dtos.Users;

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


    // Método para obtener los usuarios seguidos por un usuario específico
    public async Task<ICollection<GetUserDto>> GetFollowedUsersAsync(long userId) {
        return await _dbContext.Following
            .Where(f => f.FollowerId == userId)
            .Join(
                _dbContext.User,
                f => f.FollowedId,
                u => u.Id,
                (f, u) => new GetUserDto {
                    Id = u.Id,
                    Nickname = u.Nickname!,
                    AvatarPath = u.AvatarPath!
                }
            )
            .AsNoTracking()
            .ToArrayAsync();
    }

    // Metodo para obtener los usuarios que siguen a un usuario específico
    public async Task<ICollection<GetUserDto>> GetFollowerUsersAsync(long userId) {
        return await _dbContext.Following
            .Where(f => f.FollowedId == userId)
            .Join(
                _dbContext.User,
                f => f.FollowerId,
                u => u.Id,
                (f, u) => new GetUserDto {
                    Id = u.Id,
                    Nickname = u.Nickname!,
                    AvatarPath = u.AvatarPath!
                }
            )
            .AsNoTracking()
            .ToArrayAsync();
    }


    // Método para obtener el numero de usuarios seguidos por un usuario específico
    public async Task<int> GetFollowedUsersCountAsync(long userId) {
        return await _dbContext.Following
            .Where(f => f.FollowerId == userId)
            .CountAsync();
    }

    // Metodo para obtener el numero de usuarios que siguen a un usuario específico
    public async Task<int> GetFollowerUsersCountAsync(long userId) {
        return await _dbContext.Following
            .Where(f => f.FollowedId == userId)
            .CountAsync();
    }
}