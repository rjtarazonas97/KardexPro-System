using Microsoft.EntityFrameworkCore;
using KardexApi.Models;

namespace KardexApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Estas propiedades DbSet son las que vinculan tus clases C# con las tablas de SQL Server
        public DbSet<Producto> Productos { get; set; }
        public DbSet<CompraCab> CompraCab { get; set; }
        public DbSet<CompraDet> CompraDet { get; set; }
        public DbSet<VentaCab> VentaCab { get; set; }
        public DbSet<VentaDet> VentaDet { get; set; }
        public DbSet<MovimientoCab> MovimientoCab { get; set; }
        public DbSet<MovimientoDet> MovimientoDet { get; set; }
    }
}