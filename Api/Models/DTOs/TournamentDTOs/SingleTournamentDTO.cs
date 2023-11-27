using Microsoft.Identity.Client;

namespace Api.Models.DTOs.TournamentDTOs;

public class SingleTournamentDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Count { get; set; }
    public string Description { get; set; } = null!;
    public string TournamentType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public RoundInfo RoundInfo { get; set; } = null!;

    public SingleTournamentDTO(Tournament tournament)
    {
        Id = tournament.Id;
        Name = tournament.Name;
        Count = tournament.Count;
        TournamentType = tournament.TournamentType;
        StartDate = tournament.StartDate;
        EndDate = tournament.EndDate;
        Description = tournament.Description;
        RoundInfo = tournament.RoundInfo ?? new RoundInfo();
    }
}