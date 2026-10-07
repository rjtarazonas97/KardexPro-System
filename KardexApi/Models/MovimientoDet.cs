using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KardexApi.Models
{
    public class MovimientoDet
    {
        [Key]
        public int Id_MovimientoDet { get; set; }
        public int Id_movimientocab { get; set; }
        public int Id_Producto { get; set; }
        public int Cantidad { get; set; }

        [ForeignKey("Id_movimientocab")]
        public MovimientoCab MovimientoCab { get; set; } = null!;
    }
}