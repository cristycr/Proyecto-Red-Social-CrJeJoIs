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

        string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        string filePath = Path.Combine(uploadsFolder, file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        string fileUrl = $"/uploads/{file.FileName}";

        return (file.FileName, fileUrl);
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