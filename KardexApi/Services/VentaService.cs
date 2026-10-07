using KardexApi.Data;
using KardexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KardexApi.Services
{
    public class VentaService
    {
        private readonly AppDbContext _context;

        public VentaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<VentaCab>> ListarVentas()
        {
            return await _context.VentaCab.ToListAsync();
        }

        public async Task<(bool Exito, string Mensaje)> RegistrarVenta(VentaRequestDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                decimal subTotalCab = 0;
                decimal igvCab = 0;
                decimal totalCab = 0;

                // 1. Validar Stock y Calcular Totales
                foreach (var det in request.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(det.Id_producto);
                    if (producto == null)
                        return (false, $"El producto con ID {det.Id_producto} no existe.");

                    // Calcular Stock Actual basado en Movimientos (Kardex)
                    var entradas = await _context.MovimientoDet
                        .Include(m => m.MovimientoCab)
                        .Where(m => m.Id_Producto == det.Id_producto && m.MovimientoCab.Id_TipoMovimiento == 1)
                        .SumAsync(m => m.Cantidad);

                    var salidas = await _context.MovimientoDet
                        .Include(m => m.MovimientoCab)
                        .Where(m => m.Id_Producto == det.Id_producto && m.MovimientoCab.Id_TipoMovimiento == 2)
                        .SumAsync(m => m.Cantidad);

                    var stockActual = entradas - salidas;

                    if (det.Cantidad > stockActual)
                        return (false, $"La cantidad ingresada para '{producto.Nombre_producto}' es mayor al stock disponible ({stockActual}).");

                    decimal subTotalDet = det.Cantidad * producto.PrecioVenta;
                    decimal igvDet = subTotalDet * 0.18m;
                    decimal totalDet = subTotalDet + igvDet;

                    subTotalCab += subTotalDet;
                    igvCab += igvDet;
                    totalCab += totalDet;
                }

                // 2. Registrar VentaCab
                var ventaCab = new VentaCab
                {
                    fecRegistro = DateTime.Now,
                    SubTotal = subTotalCab,
                    Igv = igvCab,
                    Total = totalCab
                };
                _context.VentaCab.Add(ventaCab);
                await _context.SaveChangesAsync();

                // 3. Preparar MovimientoCab (Kardex) - Tipo 2 = Salida
                var movCab = new MovimientoCab
                {
                    Fec_registro = DateTime.Now,
                    Id_TipoMovimiento = 2,
                    Id_DocumentoOrigen = ventaCab.Id_VentaCab
                };
                _context.MovimientoCab.Add(movCab);
                await _context.SaveChangesAsync();

                // 4. Registrar Detalles
                foreach (var det in request.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(det.Id_producto);

                    decimal subTotalDet = det.Cantidad * producto!.PrecioVenta;
                    decimal igvDet = subTotalDet * 0.18m;
                    decimal totalDet = subTotalDet + igvDet;

                    _context.VentaDet.Add(new VentaDet
                    {
                        Id_VentaCab = ventaCab.Id_VentaCab,
                        Id_producto = det.Id_producto,
                        Cantidad = det.Cantidad,
                        Precio = producto.PrecioVenta,
                        Sub_Total = subTotalDet,
                        Igv = igvDet,
                        Total = totalDet
                    });

                    _context.MovimientoDet.Add(new MovimientoDet
                    {
                        Id_movimientocab = movCab.Id_MovimientoCab,
                        Id_Producto = det.Id_producto,
                        Cantidad = det.Cantidad
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (true, "Venta registrada con éxito.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, $"Error al registrar la venta: {ex.Message}");
            }
        }
    }
}