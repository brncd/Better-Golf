using Api.Models;

namespace Api.Models.DTOs.RoundDTOs;

public class RoundDTO
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    public int RoundNumber { get; set; }
    public DateOnly Date { get; set; }

    public RoundDTO(Round round)
    {
        Id = round.Id;
        TournamentId = round.TournamentId;
        RoundNumber = round.RoundNumber;
        Date = round.Date;
    }
}
