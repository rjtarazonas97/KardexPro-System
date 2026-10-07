using System.ComponentModel.DataAnnotations;

namespace KardexApi.Models
{
    public class VentaCab
    {
        [Key]
        public int Id_VentaCab { get; set; }
        public DateTime fecRegistro { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Igv { get; set; }
        public decimal Total { get; set; }
    }
}