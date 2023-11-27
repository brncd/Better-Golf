namespace Api.Models.DTOs.TournamentDTOs;

public class TournamentListGetDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string TournamentType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int PlayerCount { get; set; }

    public TournamentListGetDTO(Tournament tournament)
    {
        Id = tournament.Id;
        Name = tournament.Name;
        TournamentType = tournament.TournamentType;
        StartDate = tournament.StartDate;
        EndDate = tournament.EndDate;
        PlayerCount = tournament.Count;
    }
}
