using Microsoft.EntityFrameworkCore;            //Herramientas de windows
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;   //Los ingredientes de la BD
using System.Threading.Tasks;                   //Otras herramientas: async, away...


namespace SocialNetwork.Models.DataBase.Repositories;

public class FollowingRepository : BaseRepository<Following, long>
{
    //Variable para guardar la conexion con la BD (¿¿CAMBIAR NOMBRE??)
    private readonly SocialNetworkContext _context;

    //CONSTRUCTOR. Se ejecuta cuando se crear el repositorio
    //Recibe el context de Program y lo guarda en la variable
    public FollowingRepository(SocialNetworkContext context) :base(context)
    {
        _context = context;
    }
    
    //LISTAR USUARIOS SEGUIDOS (GET)
    public async Task<List<User>> ObtenerSeguidos(long Id)
    {
        return await _context.Following
            .Where(f => f.Follower == Id) // FILTRO: El usuario logeado es el origen
            .Select(f => f.UserFollowed)    // SELECCIÓN: Coge a la persona destino
            .ToListAsync();                 // Ejecuta y saca en lista
    }

    //LISTAR USUARIOS QUE SIGUEN (GET)
    public async Task<List<User>> ObtenerSeguidores(long Id)
    {
        return await _context.Following
            .Where(f => f.Followed == Id) // FILTRO: El usuario logeado es el destino
            .Select(f => f.UserFollower)    // SELECCIÓN: Coge a la persona destino
            .ToListAsync();
    }

    //SEGUIR (POST)
    public async Task<bool> CrearSeguimiento(long idFollower, long idFollowed)
    {
        if (idFollower == idFollowed) return false; //Un usuario no se puede seguir a sí mismo

        bool yaExiste = await _context.Following
            .AnyAsync(f => f.Follower == idFollower && f.Followed == idFollowed);

        if (yaExiste) return false;

        //Crear Seguimiento
        var newFollowing = new Following
        {
            Follower = idFollower,
            Followed = idFollowed
        }
        _context.Followings.Add(nuevoFollowing); // Se pone en la bandeja de salida
        await _context.SaveChangesAsync();       // Se envía a la DB
        return true;
    }

    //DEJAR DE SEGUIR (DELETE)
    public async Task<bool> EliminarSeguimiento(long idFollower, long idFollowed)
    {
        // Buscamos la fila exacta
        // FirstOrDefaultAsync: "Dame el primero que encuentres, o null si no hay ninguno"
        var conexion = await _context.Followings
            .FirstOrDefaultAsync(f => f.Follower == idFollower && f.Followed == idFollowed);

        if (conexion == null) return false; // No existía

        _context.Followings.Remove(conexion); // Márcadolo para borrar
        await _context.SaveChangesAsync();    // Ejecuta el borrado
        return true;
    }
}