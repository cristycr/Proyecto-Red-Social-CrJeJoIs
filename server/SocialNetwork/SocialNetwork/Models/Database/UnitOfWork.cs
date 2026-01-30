using SocialNetwork.Models.Database.Repositories;

namespace SocialNetwork.Models.Database; 
public class UnitOfWork {
    private readonly SocialNetworkContext? _context;

    public PostRepository PostRepository => field ??= new PostRepository(_context!);
    public UserRepository UserRepository => field ??= new UserRepository(_context!);
    public FollowingRepository FollowingRepository => field ??= new FollowingRepository(_context!);

    public UnitOfWork(SocialNetworkContext context) {
        _context = context;
    }

    public async Task<bool> SaveAsync() {
        return await _context!.SaveChangesAsync() > 0;
    }
}
