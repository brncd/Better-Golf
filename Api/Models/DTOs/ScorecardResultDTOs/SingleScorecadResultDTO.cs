namespace Api.Models.DTOs.ScorecardResultDTOs;

public class SingleScorecardResultDTO
{
    public int Id { get; set; }
    public int Strokes { get; set; }
    public int RoundNumber { get; set; }
    public int HoleNumber { get; set; }

    public SingleScorecardResultDTO(ScorecardResult scorecardResult)
    {
        Id = scorecardResult.Id;
        Strokes = scorecardResult.Strokes;
        RoundNumber = scorecardResult.RoundNumber;
        HoleNumber = scorecardResult.Hole.Number;
    }
}