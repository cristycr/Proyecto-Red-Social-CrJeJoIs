using Microsoft.EntityFrameworkCore;            //Herramientas de windows
using SocialNetwork.Models.Database;
using SocialNetwork.Models.Database.Entities;   //Los ingredientes de la BD
using System.Threading.Tasks;                   //Otras herramientas: async, away...


namespace SocialNetwork.Models.DataBase.Repositories
{
    public class FollowingRepository
    {
        //Variable para guardar la conexion con la BD (¿¿CAMBIAR NOMBRE??)
        private readonly SocialNetworkContext _context;

        //CONSTRUCTOR. Se ejecuta cuando se crear el repositorio
        //Recibe el context de Program y lo guarda en la variable
        public FollowingRepository(SocialNetworkContext context)
        {
            _context = context;
        }


    }
}