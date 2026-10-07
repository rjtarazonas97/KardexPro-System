namespace KardexApi.Models
{
    public class VentaRequestDto
    {
        public List<VentaDetalleDto> Detalles { get; set; } = new List<VentaDetalleDto>();
    }

    public class VentaDetalleDto
    {
        public int Id_producto { get; set; }
        public int Cantidad { get; set; }
    }
}