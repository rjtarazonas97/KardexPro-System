using KardexApi.Data;
using KardexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KardexApi.Services
{
    public class CompraService
    {
        private readonly AppDbContext _context;

        public CompraService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CompraCab>> ListarCompras()
        {
            return await _context.CompraCab.ToListAsync();
        }

        public async Task<bool> RegistrarCompra(CompraRequestDto request)
        {
            // Iniciamos la Transacción
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                decimal subTotalCab = 0;
                decimal igvCab = 0;
                decimal totalCab = 0;

                // 1. Calcular totales de la Cabecera de Compra
                foreach (var det in request.Detalles)
                {
                    decimal subTotalDet = det.Cantidad * det.Precio;
                    decimal igvDet = subTotalDet * 0.18m; // IGV 18%
                    decimal totalDet = subTotalDet + igvDet;

                    subTotalCab += subTotalDet;
                    igvCab += igvDet;
                    totalCab += totalDet;
                }

                // 2. Registrar CompraCab
                var compraCab = new CompraCab
                {
                    FecRegistro = DateTime.Now,
                    SubTotal = subTotalCab,
                    Igv = igvCab,
                    Total = totalCab
                };
                _context.CompraCab.Add(compraCab);
                await _context.SaveChangesAsync(); // Guardamos para obtener el ID generado

                // 3. Preparar MovimientoCab (Kardex) - Tipo 1 = Entrada
                var movCab = new MovimientoCab
                {
                    Fec_registro = DateTime.Now,
                    Id_TipoMovimiento = 1,
                    Id_DocumentoOrigen = compraCab.Id_CompraCab
                };
                _context.MovimientoCab.Add(movCab);
                await _context.SaveChangesAsync();

                // 4. Registrar Detalles e impactar el Producto
                foreach (var det in request.Detalles)
                {
                    decimal subTotalDet = det.Cantidad * det.Precio;
                    decimal igvDet = subTotalDet * 0.18m;
                    decimal totalDet = subTotalDet + igvDet;

                    // A) Insertar CompraDet
                    _context.CompraDet.Add(new CompraDet
                    {
                        Id_CompraCab = compraCab.Id_CompraCab,
                        Id_producto = det.Id_producto,
                        Cantidad = det.Cantidad,
                        Precio = det.Precio,
                        Sub_Total = subTotalDet,
                        Igv = igvDet,
                        Total = totalDet
                    });

                    // B) Insertar MovimientoDet (Kardex)
                    _context.MovimientoDet.Add(new MovimientoDet
                    {
                        Id_movimientocab = movCab.Id_MovimientoCab,
                        Id_Producto = det.Id_producto,
                        Cantidad = det.Cantidad
                    });

                    // C) Actualizar Precio y Costo del Producto (REQUISITO)
                    var producto = await _context.Productos.FindAsync(det.Id_producto);
                    if (producto != null)
                    {
                        producto.Costo = det.Precio;
                        producto.PrecioVenta = det.Precio * 1.35m; // Ganancia del 35%
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Confirmamos que TODO salió bien
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(); // Si algo falla, deshacemos todo
                return false;
            }
        }
    }
}