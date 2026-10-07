using KardexApi.Models;
using KardexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KardexApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CompraController : ControllerBase
    {
        private readonly CompraService _compraService;

        public CompraController(CompraService compraService)
        {
            _compraService = compraService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            return Ok(await _compraService.ListarCompras());
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] CompraRequestDto request)
        {
            if (request.Detalles == null || request.Detalles.Count == 0)
                return BadRequest("La compra debe tener al menos un producto.");

            var exito = await _compraService.RegistrarCompra(request);
            if (exito)
                return Ok(new { mensaje = "Compra registrada con éxito. Kardex y precios actualizados." });
            
            return StatusCode(500, "Ocurrió un error en el servidor al registrar la compra.");
        }
    }
}