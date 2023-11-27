using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Api.Data;
using Api.Models.DTOs.ScorecardDTOs;
using Api.Models.Engine;

namespace Api.Models
{
    public class Result
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public int PlayerId { get; set; }
        public int Score { get; set; }
        public int TotalStrokes { get; set; }
        public string? TournamentType { get; set; }

        public class TournamentRanking
        {
            [Key]
            public int Position { get; set; }
            public int TournamentId { get; set; }
            public int PlayerId { get; set; }
            public int TotalStrokes { get; set; }
        }

        public static async Task<IResult> GenerateTournamentRanking(BgContext db, int tournamentId)
        {
            var rankings = db.Scorecards.Where(scorecard => scorecard.TournamentId == tournamentId)
                .GroupBy(scorecard => scorecard.PlayerId)
                .Select(group => new Result.TournamentRanking
                {
                    TournamentId = tournamentId,
                    PlayerId = group.Key,
                    TotalStrokes = group.Sum(scorecard => scorecard.TotalStrokes)
                })
                .OrderBy(ranking => ranking.TotalStrokes).ToList();

            db.TournamentRankings.AddRange(rankings);
            await db.SaveChangesAsync();

            return Results.Ok();
        }
        public static List<TournamentRanking> GetTournamentRanking(BgContext db, int tournamentId)
        {
            return db.TournamentRankings.Where(ranking => ranking.TournamentId == tournamentId)
            .OrderBy(r => r.TotalStrokes).ToList();
        }
    }
}
