namespace SocialNetwork.Models.DataBase.Repositories;

// La interfaz simplemente representa los métodos que puede
// realizar una entidad y no puede realizar más métodos
// que los que se definan en la interfaz

// TEntity representa el tipo de un entidad, cualquier sea
// TId representa el tipo de la clave primaria de esa entidad

// Donde TEntity representa una clase --> where TEntity : class
public interface IRepository<TEntity, TId> where TEntity : class {
    Task<ICollection<TEntity>> GetAllAsync(); // SELECT * FROM ...
    IQueryable<TEntity> GetQueryable(bool asNoTracking = true); // Select con un WHERE
    Task<TEntity?> GetByIdAsync(TId id); // SELECT * FROM where ID ...
    Task<TEntity> InsertAsync(TEntity entity); // Insert
    Task<TEntity> UpdateAsync(TEntity entity); // Update
    Task DeleteAsync(TEntity entity); // Delete
    Task<bool> SaveAsync();
    Task<bool> ExistAsync(TId id); // Devuelve un bool que representa si existe o no la entidad con ese id
}
