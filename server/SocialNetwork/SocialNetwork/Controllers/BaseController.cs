using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SocialNetwork.Controllers
{
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        protected long CurrentUserId
        {
            get
            {
                var idClaim = User.FindFirst("id");
                if (idClaim == null)
                    throw new UnauthorizedAccessException("Token sin id");

                return long.Parse(idClaim.Value);
            }
        }

        protected string? CurrentUserRole
        {
            get
            {
                return User.FindFirst(ClaimTypes.Role)?.Value;
            }
        }
    }
}