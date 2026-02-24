using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Services;
using System.IO;

namespace SocialNetwork.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost("upload")]
    public async Task<ActionResult> UploadFile(IFormFile file)
    {
        try
        {
            var result = await _fileService.SaveFileAsync(file);
            return Ok(new { result.FileName, result.Url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
}