using Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.TournamentDTOs;

public class RoundInfoDTO
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int IntervalMinutes { get; set; }
    public int MaxPlayersPerGroup { get; set; }
}

public class TournamentPostDTO
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string TournamentType { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RoundInfoDTO? RoundInfo { get; set; }
    public double? HandicapAllowance { get; set; }
}
