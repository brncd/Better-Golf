using Api.Data;
using Api.Models.DTOs.ScorecardResultDTOs;
using Microsoft.EntityFrameworkCore;
using Api.Models;


namespace Api.Models;

public class ScorecardResult
{
    public int Id { get; set; }
    public int Strokes { get; set; }
    public int RoundNumber { get; set; }
    public Hole Hole { get; set; } = null!;
    public int HoleId { get; set; }
    public Scorecard Scorecard { get; set; } = null!;
    public int ScorecardId { get; set; }

    public ScorecardResult(int strokes, int roundNumber, Hole hole)
    {
        Strokes = strokes;
        RoundNumber = roundNumber;
        Hole = hole;
    }
    public ScorecardResult(ScorecardResultPostDTO scorecardResultPostDTO)
    {
        Strokes = scorecardResultPostDTO.Strokes;
    }
    public ScorecardResult()
    {
    }
    public override bool Equals(object? obj)
    {
        if (obj is ScorecardResult scorecardResult)
        {
            return Id == scorecardResult.Id;
        }
        return false;
    }
    public override int GetHashCode() { return Id.GetHashCode(); }
    public override string ToString()
    {
        return $"Id: {Id}, Strokes: {Strokes}, Round Number: {RoundNumber}";
    }

    

    
}