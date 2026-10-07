namespace KardexApi.Models
{
    public class KardexDto
    {
        public int Id_producto { get; set; }
        public string Nombre_producto { get; set; } = string.Empty;
        public int Stock_actual { get; set; }
        public decimal Costo { get; set; }
        public decimal PrecioVenta { get; set; }
        
        // Esta lista enviará el historial de compras y ventas de cada producto
        public List<MovimientoProductoDto> Movimientos { get; set; } = new List<MovimientoProductoDto>();
    }

    public class MovimientoProductoDto
    {
        public DateTime FechaRegistro { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty; // Dirá "Entrada" o "Salida"
        public int Cantidad { get; set; }
    }
}