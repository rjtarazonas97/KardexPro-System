using KardexApi.Models;
using KardexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KardexApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VentaController : ControllerBase
    {
        private readonly VentaService _ventaService;

        public VentaController(VentaService ventaService)
        {
            _ventaService = ventaService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            return Ok(await _ventaService.ListarVentas());
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] VentaRequestDto request)
        {
            if (request.Detalles == null || request.Detalles.Count == 0)
                return BadRequest("La venta debe tener al menos un producto.");

            var resultado = await _ventaService.RegistrarVenta(request);
            if (resultado.Exito)
                return Ok(new { mensaje = resultado.Mensaje });
            
            return BadRequest(new { error = resultado.Mensaje });
        }
    }
}