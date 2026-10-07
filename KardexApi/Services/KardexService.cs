using KardexApi.Data;
using KardexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KardexApi.Services
{
    public class KardexService
    {
        private readonly AppDbContext _context;

        public KardexService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<KardexDto>> ListarKardex()
        {
            var productos = await _context.Productos.ToListAsync();
            var kardexList = new List<KardexDto>();

            foreach (var prod in productos)
            {
                // Traer todos los movimientos de este producto específico
                var movimientosDet = await _context.MovimientoDet
                    .Include(m => m.MovimientoCab)
                    .Where(m => m.Id_Producto == prod.Id_producto)
                    .ToListAsync();

                // Calcular stock sumando tipo 1 (Entradas) y restando tipo 2 (Salidas)
                int entradas = movimientosDet.Where(m => m.MovimientoCab.Id_TipoMovimiento == 1).Sum(m => m.Cantidad);
                int salidas = movimientosDet.Where(m => m.MovimientoCab.Id_TipoMovimiento == 2).Sum(m => m.Cantidad);

                // Armar la lista de detalles de movimiento
                var movsDto = movimientosDet.Select(m => new MovimientoProductoDto
                {
                    FechaRegistro = m.MovimientoCab.Fec_registro,
                    TipoMovimiento = m.MovimientoCab.Id_TipoMovimiento == 1 ? "Entrada (Compra)" : "Salida (Venta)",
                    Cantidad = m.Cantidad
                }).OrderByDescending(m => m.FechaRegistro).ToList();

                // Agregar el producto a la lista final del Kardex
                kardexList.Add(new KardexDto
                {
                    Id_producto = prod.Id_producto,
                    Nombre_producto = prod.Nombre_producto,
                    Stock_actual = entradas - salidas,
                    Costo = prod.Costo,
                    PrecioVenta = prod.PrecioVenta,
                    Movimientos = movsDto
                });
            }

            return kardexList;
        }
    }
}