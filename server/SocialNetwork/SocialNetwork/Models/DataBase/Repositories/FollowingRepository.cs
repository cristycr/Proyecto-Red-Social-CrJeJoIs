using Microsoft.EntityFrameworkCore;            //Herramientas de windows
using SocialNetwork.Models.Database.Entities;   //Los ingredientes de la BD


namespace SocialNetwork.Models.Database.Repositories;

public class FollowingRepository : BaseRepository<Following, long> {
    //Variable para guardar la conexion con la BD (¿¿CAMBIAR NOMBRE??)
    private readonly SocialNetworkContext _context;

    //CONSTRUCTOR. Se ejecuta cuando se crear el repositorio
    //Recibe el context de Program y lo guarda en la variable
    public FollowingRepository(SocialNetworkContext context) : base(context) {
        _context = context;
    }

    //LISTAR USUARIOS SEGUIDOS (GET)===========================================================
    public async Task<List<User>> GetFolloweds(long idUser) {
        return await _context.Following
            .Where(f => f.IdFollower == idUser) // FILTRO: El usuario logeado es el origen
            .Select(f => f.Followed)            // SELECCIÓN: Coge a la persona destino
            .ToListAsync();                     // Ejecuta y saca en lista
    }

    //LISTAR USUARIOS SEGUIDORES (GET)=========================================================
    public async Task<List<User>> GetFollowers(long idUser) {
        return await _context.Following
            .Where(f => f.IdFollowed == idUser) // FILTRO: El usuario logeado es el destino
            .Select(f => f.Follower)            // SELECCIÓN: Coge a la persona destino
            .ToListAsync();
    }

    //SEGUIR (POST)============================================================================
    public async Task<bool> CreateFollowing(long idFollower, long idFollowed) {
        if (idFollower == idFollowed) return false; //Un usuario no se puede seguir a sí mismo

        bool exists = await _context.Following
            .AnyAsync(f => f.IdFollower == idFollower && f.IdFollowed == idFollowed);

        if (exists) return false;

        //Crear Seguimiento
        var newFollowing = new Following {
            IdFollower = idFollower,
            IdFollowed = idFollowed
        };

        _context.Following.Add(newFollowing); // Se pone en la bandeja de salida

        return true;
    }

    //DEJAR DE SEGUIR (DELETE)==================================================================
    public async Task<bool> DeleteFollowing(long idFollower, long idFollowed) {
        // Buscamos la fila exacta
        // FirstOrDefaultAsync: "Dame el primero que encuentres, o null si no hay ninguno"
        var conexion = await _context.Following
            .FirstOrDefaultAsync(f => f.IdFollower == idFollower && f.IdFollowed == idFollowed);

        if (conexion == null) return false;   // No existía el seguimiento

        _context.Following.Remove(conexion);  // Marcado para borrar

        return true;
    }
}