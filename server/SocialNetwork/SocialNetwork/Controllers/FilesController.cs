using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace SocialNetwork.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public FilesController(IWebHostEnvironment env)
    {
        _env = env; // Permite acceder a wwwroot
    }

    // POST: api/files/upload
    [HttpPost("upload")]
    public IActionResult UploadFile([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No se ha enviado ningún fichero.");

        string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");

        // Crear carpeta uploads si no existe
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        string filePath = Path.Combine(uploadsFolder, file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            file.CopyTo(stream);
        }

        string fileUrl = $"/uploads/{file.FileName}";
        return Ok(new { FileName = file.FileName, Url = fileUrl });
    }
}