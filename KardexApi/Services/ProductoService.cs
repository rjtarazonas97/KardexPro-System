using KardexApi.Data;
using KardexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KardexApi.Services
{
    public class ProductoService
    {
        private readonly AppDbContext _context;

        public ProductoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Producto>> ListarProductos()
        {
            return await _context.Productos.ToListAsync();
        }

        public async Task<Producto> RegistrarProducto(Producto producto)
        {
            producto.Fec_registro = DateTime.Now;
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            return producto;
        }

        public async Task<Producto?> ActualizarProducto(int id, Producto productoActualizado)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return null;

            producto.Nombre_producto = productoActualizado.Nombre_producto;
            producto.NroLote = productoActualizado.NroLote;
            producto.Costo = productoActualizado.Costo;
            producto.PrecioVenta = productoActualizado.PrecioVenta;

            await _context.SaveChangesAsync();
            return producto;
        }
    }
}