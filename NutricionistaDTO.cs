using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthifyAPI.DTOs
{
    public class NutricionistaDTO
    {
        public int NutricionistaId { get; set; }
        public int UsuarioId { get; set; }
        public string? Nome { get; set; }
    }
}
