using Api.Data;
using Api.Models;
using Api.Models.DTOs.ResultDTOs;
using Api.Models.Engine;
using Api.Models.Enums;
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

            if (tournament == null || !tournament.Scorecards.Any())
            {
                return new List<TournamentRankingDTO>();
            }

            var playerScores = tournament.Scorecards.Select(sc => {
                double score = 0;
                if (tournament.TournamentType == TournamentType.MedalPlay)
                {
                    score = ResultsEngine.MedalScratchScore(sc.PlayingHandicap, sc.ScorecardResults);
                }
                else if (tournament.TournamentType == TournamentType.Stableford)
                {
                    score = ResultsEngine.StablefordScore(sc.ScorecardResults);
                }
                return new PlayerScore(sc, score);
            }).ToList();

            // Sort players using the custom tie-breaker logic
            playerScores.Sort(new PlayerScoreComparer(tournament.TournamentType));

            var rankings = new List<TournamentRanking>();
            int currentPosition = 1;
            for (int i = 0; i < playerScores.Count; i++)
            {
                if (i > 0 && new PlayerScoreComparer(tournament.TournamentType).Compare(playerScores[i-1], playerScores[i]) < 0)
                {
                    currentPosition = i + 1;
                }

                rankings.Add(new TournamentRanking
                {
                    TournamentId = tournamentId,
                    PlayerId = playerScores[i].Scorecard.PlayerId,
                    TotalStrokes = (int)playerScores[i].Score, // Casting to int, consider if double is better
                    Position = currentPosition
                });
            }

            // Clear existing rankings and save new ones
            var existingRankings = await _db.TournamentRankings.Where(r => r.TournamentId == tournamentId).ToListAsync();
            _db.TournamentRankings.RemoveRange(existingRankings);
            
            await _db.TournamentRankings.AddRangeAsync(rankings);
            await _db.SaveChangesAsync();

            // Return DTOs
            return rankings.Select(r => new TournamentRankingDTO 
            {
                PlayerId = r.PlayerId,
                PlayerName = "", // Will be populated by join if needed
                Position = r.Position,
                TotalStrokes = r.TotalStrokes,
                RoundsPlayed = 0, // Calculate if needed
                AverageStrokes = 0, // Calculate if needed
                Handicap = 0, // Get from player if needed
                StrokesBehindPrevious = 0,
                PercentileRank = 0,
                Quartile = 0
            }).ToList();
        }

        public async Task<List<TournamentRankingDTO>> GetTournamentRankingAsync(int tournamentId)
        {
            return await _db.TournamentRankings.Where(ranking => ranking.TournamentId == tournamentId)
                .OrderBy(r => r.Position)
                .ThenBy(r => r.TotalStrokes)
                .Select(r => new TournamentRankingDTO 
                {
                    PlayerId = r.PlayerId,
                    PlayerName = "", // Will be populated by join if needed
                    Position = r.Position,
                    TotalStrokes = r.TotalStrokes,
                    RoundsPlayed = 0, // Calculate if needed
                    AverageStrokes = 0, // Calculate if needed
                    Handicap = 0, // Get from player if needed
                    StrokesBehindPrevious = 0,
                    PercentileRank = 0,
                    Quartile = 0
                })
                .ToListAsync();
        }
    }

    // Helper class to hold player score and scorecard for sorting
    internal class PlayerScore
    {
        public Scorecard Scorecard { get; }
        public double Score { get; }

        public PlayerScore(Scorecard scorecard, double score)
        {
            Scorecard = scorecard;
            Score = score;
        }
    }

    // Custom comparer for sorting player scores with tie-breaking
    internal class PlayerScoreComparer : IComparer<PlayerScore>
    {
        private readonly TournamentType _tournamentType;

        public PlayerScoreComparer(TournamentType tournamentType)
        {
            _tournamentType = tournamentType;
        }

        public int Compare(PlayerScore? x, PlayerScore? y)
        {
            if (x == null || y == null) return 0;

            // Primary comparison on total score
            int scoreComparison = _tournamentType == TournamentType.Stableford 
                ? y.Score.CompareTo(x.Score) // Descending for Stableford
                : x.Score.CompareTo(y.Score); // Ascending for MedalPlay

            if (scoreComparison != 0) return scoreComparison;

            // Tie-breaking logic (countback)
            int back9Comparison = CompareHoleRange(x.Scorecard, y.Scorecard, 10, 18);
            if (back9Comparison != 0) return back9Comparison;

            int back6Comparison = CompareHoleRange(x.Scorecard, y.Scorecard, 13, 18);
            if (back6Comparison != 0) return back6Comparison;

            int back3Comparison = CompareHoleRange(x.Scorecard, y.Scorecard, 16, 18);
            if (back3Comparison != 0) return back3Comparison;

            int lastHoleComparison = CompareHoleRange(x.Scorecard, y.Scorecard, 18, 18);
            if (lastHoleComparison != 0) return lastHoleComparison;
            
            return 0; // Players are still tied
        }

        private int CompareHoleRange(Scorecard sc1, Scorecard sc2, int startHole, int endHole)
        {
            var results1 = sc1.ScorecardResults.Where(r => r.Hole.Number >= startHole && r.Hole.Number <= endHole).ToList();
            var results2 = sc2.ScorecardResults.Where(r => r.Hole.Number >= startHole && r.Hole.Number <= endHole).ToList();

            double score1 = 0;
            double score2 = 0;

            if (_tournamentType == TournamentType.Stableford)
            {
                score1 = ResultsEngine.StablefordScore(results1);
                score2 = ResultsEngine.StablefordScore(results2);
            }
            else // MedalPlay
            {
                score1 = results1.Sum(r => r.Strokes);
                score2 = results2.Sum(r => r.Strokes);
            }

            return _tournamentType == TournamentType.Stableford
                ? score2.CompareTo(score1) // Descending for Stableford
                : score1.CompareTo(score2); // Ascending for MedalPlay
        }
    }
}