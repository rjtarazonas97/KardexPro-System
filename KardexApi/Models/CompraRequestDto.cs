namespace KardexApi.Models
{
    // Esta clase sirve para recibir los datos desde el Frontend (React)
    public class CompraRequestDto
    {
        public List<CompraDetalleDto> Detalles { get; set; } = new List<CompraDetalleDto>();
    }

    public class CompraDetalleDto
    {
        public int Id_producto { get; set; }
        public int Cantidad { get; set; }
        public decimal Precio { get; set; } // Este será el costo al que compramos el producto
    }
}