using Api.Models.Enums;

namespace Api.Models.DTOs.TournamentDTOs;

public class TournamentPostDTO
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public TournamentType TournamentType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public RoundInfo RoundInfo { get; set; } = null!;
}
