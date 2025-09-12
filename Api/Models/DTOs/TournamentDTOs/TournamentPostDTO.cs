using Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.TournamentDTOs;

public class TournamentPostDTO
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public TournamentType TournamentType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Description { get; set; }
    public int? RoundInfo { get; set; } // Made optional
    public double? HandicapAllowance { get; set; }
}
