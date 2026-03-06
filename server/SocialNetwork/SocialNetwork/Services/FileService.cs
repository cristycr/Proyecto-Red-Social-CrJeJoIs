using Microsoft.AspNetCore.Hosting;
using SocialNetwork.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;

    public FileService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<(string FileName, string Url)> SaveFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("No se ha enviado ningún fichero.");

        // Carpeta uploads dentro de wwwroot
        string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Generar un nombre único para el archivo
        string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        string filePath = Path.Combine(uploadsFolder, fileName);

        // Guardar el archivo
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // URL para acceder desde el frontend
        string fileUrl = $"/uploads/{fileName}";

        return (fileName, fileUrl);
    }

    public Task DeleteFileAsync(string fileName)
    {
        string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
        string filePath = Path.Combine(uploadsFolder, fileName);

        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }
}