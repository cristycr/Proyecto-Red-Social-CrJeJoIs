using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace SocialNetwork.Models.Database.Repositories;

public abstract class BaseRepository<TEntity, TId> : IRepository<TEntity, TId> where TEntity : class {
    protected SocialNetworkContext _dbContext { get; init; }
    public BaseRepository(SocialNetworkContext dbContext) {
        _dbContext = dbContext;
    }
    public async Task<ICollection<TEntity>> GetAllAsync() {
        return await _dbContext.Set<TEntity>().ToArrayAsync();
    }
    public IQueryable<TEntity> GetQueryable(bool asNoTracking = true) {
        DbSet<TEntity> entities = _dbContext.Set<TEntity>();

        return asNoTracking ? entities.AsNoTracking() : entities;
    }
    public async Task<TEntity?> GetByIdAsync(TId id) {
        return await _dbContext.Set<TEntity>().FindAsync(id);
    }
    public async Task<TEntity> InsertAsync(TEntity entity) {
        EntityEntry<TEntity> entry = await _dbContext.Set<TEntity>().AddAsync(entity);
        return entry.Entity;
    }
    public async Task<TEntity> UpdateAsync(TEntity entity) {
        EntityEntry<TEntity> entry = _dbContext.Set<TEntity>().Update(entity);
        return entry.Entity;
    }
    public async Task DeleteAsync(TEntity entity) {
        _dbContext.Set<TEntity>().Remove(entity);
    }
    public async Task<bool> ExistAsync(TId id) {
        return await GetByIdAsync(id) is not null;
    }
}