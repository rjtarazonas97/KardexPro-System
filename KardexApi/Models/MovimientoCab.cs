using System.ComponentModel.DataAnnotations;

namespace KardexApi.Models
{
    public class MovimientoCab
    {
        [Key]
        public int Id_MovimientoCab { get; set; }
        public DateTime Fec_registro { get; set; }
        public int Id_TipoMovimiento { get; set; } // 1: Entrada, 2: Salida
        public int Id_DocumentoOrigen { get; set; }
    }
}