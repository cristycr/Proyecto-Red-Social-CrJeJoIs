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
}