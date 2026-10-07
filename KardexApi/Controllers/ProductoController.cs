using KardexApi.Models;
using KardexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KardexApi.Controllers
{
    [Authorize] // Protege todas las rutas de este controlador
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly ProductoService _productoService;

        public ProductoController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            return Ok(await _productoService.ListarProductos());
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] Producto producto)
        {
            var nuevo = await _productoService.RegistrarProducto(producto);
            return Ok(nuevo);
        }

        [HttpPut("actualizar/{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] Producto producto)
        {
            var actualizado = await _productoService.ActualizarProducto(id, producto);
            if (actualizado == null) return NotFound("Producto no encontrado");
            return Ok(actualizado);
        }
    }
}