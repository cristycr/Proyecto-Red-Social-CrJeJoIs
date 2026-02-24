namespace SocialNetwork.Services
{
    public interface IFileService
    {
        Task<(string FileName, string Url)> SaveFileAsync(IFormFile file);
        Task DeleteFileAsync(string fileName);
    }
}
