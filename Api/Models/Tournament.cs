using Api.Models.DTOs.TournamentDTOs;
using Api.Models.Enums;

namespace Api.Models;

public class Tournament
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public TournamentType TournamentType { get; set; }
    public int Count { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public RoundInfo RoundInfo { get; set; } = null!;
    public ICollection<Player> Players { get; set; } = new List<Player>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Scorecard> Scorecards { get; set; } = new List<Scorecard>();
    public TournamentStatus Status { get; set; } // Added TournamentStatus property
    public ICollection<Round> Rounds { get; set; } = new List<Round>(); // Added Rounds collection

    public Tournament(TournamentPostDTO tournamentPostDTO)
    {
        Name = tournamentPostDTO.Name;
        TournamentType = tournamentPostDTO.TournamentType;
        StartDate = tournamentPostDTO.StartDate;
        EndDate = tournamentPostDTO.EndDate;
        Description = tournamentPostDTO.Description;
        RoundInfo = tournamentPostDTO.RoundInfo;
    }

    public Tournament()
    {
    }
    public override bool Equals(object? obj)
    {
        if (obj is Tournament tournament)
        {
            return this.Id == tournament.Id;
        }
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $"ID Tournament: {Id}, Name: {Name}. Type: {TournamentType}";
    }
}