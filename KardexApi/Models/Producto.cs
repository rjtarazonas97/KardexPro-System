using System.ComponentModel.DataAnnotations;

namespace KardexApi.Models
{
    public class Producto
    {
        [Key]
        public int Id_producto { get; set; }
        public string Nombre_producto { get; set; } = string.Empty;
        public string? NroLote { get; set; }
        public DateTime Fec_registro { get; set; }
        public decimal Costo { get; set; }
        public decimal PrecioVenta { get; set; }
    }
}