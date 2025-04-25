using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthifyAPI.Models.DTOs
{
    public class ConsultaDTO
{
    public int ClienteId { get; set; }
    public int NutricionistaId { get; set; }
    public DateTime DataConsulta { get; set; }
    public string TipoConsulta { get; set; }
    public string Status { get; set; }
    public string Observacoes { get; set; }
}



} 
