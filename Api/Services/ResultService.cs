using Api.Data;
using Api.Models;
using Api.Models.DTOs.ResultDTOs;
using Api.Models.Engine;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class ResultService
    {
        private readonly BgContext _db;

        public ResultService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<TournamentRankingDTO>> GenerateTournamentRankingAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Scorecards)
                    .ThenInclude(sc => sc.Player)
                .Include(t => t.Scorecards)
                    .ThenInclude(sc => sc.ScorecardResults)
                        .ThenInclude(sr => sr.Hole)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null)
            {
                return new List<TournamentRankingDTO>();
            }

            var playerScores = new Dictionary<int, double>();

            foreach (var scorecard in tournament.Scorecards)
            {
                double score = 0;
                if (tournament.TournamentType == "MedalPlay")
                {
                    score = ResultsEngine.MedalScratchScore(scorecard.PlayingHandicap, scorecard.ScorecardResults);
                }
                else if (tournament.TournamentType == "Stableford")
                {
                    score = ResultsEngine.StablefordScore(scorecard.ScorecardResults);
                }
                // Add other tournament types as needed

                if (playerScores.ContainsKey(scorecard.PlayerId))
                {
                    playerScores[scorecard.PlayerId] += score;
                }
                else
                {
                    playerScores.Add(scorecard.PlayerId, score);
                }
            }

            // Order by score (ascending for MedalPlay, descending for Stableford)
            var orderedPlayerScores = tournament.TournamentType == "Stableford"
                ? playerScores.OrderByDescending(ps => ps.Value)
                : playerScores.OrderBy(ps => ps.Value);

            var rankings = new List<TournamentRanking>();
            int currentPosition = 1;
            int playersAtCurrentPosition = 1;
            double? lastScore = null;

            foreach (var ps in orderedPlayerScores)
            {

                if (lastScore.HasValue && lastScore.Value != ps.Value)
                {
                    currentPosition += playersAtCurrentPosition;
                    playersAtCurrentPosition = 1;
                } else if (lastScore.HasValue && lastScore.Value == ps.Value)
                {
                    playersAtCurrentPosition++;
                }

                rankings.Add(new TournamentRanking
                {
                    TournamentId = tournamentId,
                    PlayerId = ps.Key,
                    TotalStrokes = (int)ps.Value, // Casting to int, consider if double is better
                    Position = currentPosition
                });

                lastScore = ps.Value;
            }

            // Clear existing rankings and save new ones
            var existingRankings = await _db.TournamentRankings.Where(r => r.TournamentId == tournamentId).ToListAsync();
            _db.TournamentRankings.RemoveRange(existingRankings);
            
            await _db.TournamentRankings.AddRangeAsync(rankings);
            await _db.SaveChangesAsync();

            // Return DTOs
            return rankings.Select(r => new TournamentRankingDTO(r)).ToList();
        }

        public async Task<List<TournamentRankingDTO>> GetTournamentRankingAsync(int tournamentId)
        {
            return await _db.TournamentRankings.Where(ranking => ranking.TournamentId == tournamentId)
                .OrderBy(r => r.Position)
                .ThenBy(r => r.TotalStrokes)
                .Select(r => new TournamentRankingDTO(r))
                .ToListAsync();
        }
    }
}
