using Api.Data;
using Microsoft.EntityFrameworkCore;
using Api.Models.DTOs.ScorecardDTOs;
using System.Reflection.Metadata.Ecma335;

namespace Api.Models;

public class Scorecard
{
    public int Id { get; set; }
    public int PlayingHandicap { get; set; }
    public List<ScorecardResult> ScorecardResults { get; set; } = new List<ScorecardResult>();
    public Player? Player { get; set; }
    public int PlayerId { get; set; }
    public Tournament? Tournament { get; set; }
    public int TournamentId { get; set; }
    public int TotalStrokes { get; set; }


    public Scorecard()
    {
    }
    public Scorecard(Player player)
    {
        Player = player;
    }
    public override string ToString() 
    {
        return $"Id: {Id}, PlayingHandicap: {PlayingHandicap}";
    }
    public override bool Equals(object? obj)
    {
        if (obj is Scorecard scorecard)
            return scorecard.Id == Id ;
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public static async Task<IResult> GetAllScorecards(BgContext db, int tournamentId)
    {
        await Result.GenerateTournamentRanking(db, tournamentId);

        // Obtiene todos los marcadores para el torneo especificado por tournamentId
        var scorecards = await db.Scorecards.Where(x => x.TournamentId == tournamentId)
            .Select(x => new ScorecardListGetDTO(x)).ToArrayAsync();

        return Results.Ok(scorecards);
    }
    public static async Task<IResult> GetScorecard(int id, BgContext db)
    {
        var scorecard = await db.Scorecards.FindAsync(id);

        if (scorecard == null) { return Results.NotFound(); }

        return Results.Ok(scorecard);
    }

    public static async Task<IResult> CreateScorecard(BgContext db, Scorecard scorecard)
    {
        db.Scorecards.Add(scorecard);
        await db.SaveChangesAsync();

        return Results.Created($"/Scorecards/{scorecard.Id}", scorecard);
    }
    public static async Task<IResult> UpdateScorecard(int id, BgContext db, Scorecard InputScorecard)
    {
        var scorecard = await db.Scorecards.FindAsync(id);

        if (scorecard == null) { return Results.NotFound(); }

        scorecard.PlayingHandicap = InputScorecard.PlayingHandicap;
        scorecard.ScorecardResults = InputScorecard.ScorecardResults;

        await db.SaveChangesAsync();

        return Results.NoContent();
    }
    
    public static async Task<IResult> DeleteScorecard(int id, BgContext db)
    {
        var scorecard = await db.Scorecards.FindAsync(id);

        if (scorecard == null) { return Results.NotFound(); }

        db.Scorecards.Remove(scorecard);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
