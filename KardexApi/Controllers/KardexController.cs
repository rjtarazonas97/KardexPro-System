using KardexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KardexApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class KardexController : ControllerBase
    {
        private readonly KardexService _kardexService;

        public KardexController(KardexService kardexService)
        {
            _kardexService = kardexService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            return Ok(await _kardexService.ListarKardex());
        }
    }
}