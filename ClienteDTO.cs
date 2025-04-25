using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthifyAPI.DTOs
{
    public class ClienteDTO
    {
        public int ClienteId { get; set; }
        public int UsuarioId { get; set; }
        public string? Nome { get; set; }
    }
}
