namespace Api.Models.DTOs.TournamentDTOs;

public class TournamentPostDTO
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string TournamentType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public RoundInfo RoundInfo { get; set; } = null!;
}