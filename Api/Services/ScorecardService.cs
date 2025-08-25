using Api.Data;
using Api.Models;
using Api.Models.DTOs.ScorecardDTOs;
using Api.Services; // Added
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;

namespace Api.Services
{
    public class ScorecardService
    {
        private readonly BgContext _db;
        private readonly ResultService _resultService; // Added

        public ScorecardService(BgContext db, ResultService resultService) // Added resultService
        {
            _db = db;
            _resultService = resultService; // Added
        }

        public async Task<List<ScorecardListGetDTO>> GetAllScorecardsAsync(int tournamentId)
        {
            // Original logic called Result.GenerateTournamentRanking here.
            // This should probably be a separate process or triggered by score updates.
            // For now, I'll just get the scorecards.
             // Changed

            var scorecards = await _db.Scorecards.Where(x => x.TournamentId == tournamentId)
                .Select(x => new ScorecardListGetDTO(x)).ToListAsync();

            return scorecards;
        }

        public async Task<Scorecard?> GetScorecardByIdAsync(int id)
        {
            return await _db.Scorecards.FindAsync(id);
        }

        public async Task<Scorecard> CreateScorecardAsync(Scorecard scorecard)
        {
            _db.Scorecards.Add(scorecard);
            await _db.SaveChangesAsync();
            return scorecard;
        }

        public async Task<Result<bool>> UpdateScorecardAsync(int id, Scorecard InputScorecard)
        {
            var scorecard = await _db.Scorecards.FindAsync(id);
            if (scorecard == null) return Result<bool>.Failure(new Error("ScorecardNotFound", "Scorecard not found."));

            scorecard.PlayingHandicap = InputScorecard.PlayingHandicap;

            // Update existing ScorecardResults
            foreach (var inputResult in InputScorecard.ScorecardResults)
            {
                var existingResult = scorecard.ScorecardResults.FirstOrDefault(sr => sr.HoleId == inputResult.HoleId);
                if (existingResult != null)
                {
                    existingResult.Strokes = inputResult.Strokes;
                }
                // If a ScorecardResult is in InputScorecard.ScorecardResults but not in existing, it's not handled here.
                // This assumes ScorecardResults are pre-generated and only strokes are updated.
            }

            // Recalculate TotalStrokes
            scorecard.TotalStrokes = scorecard.ScorecardResults.Sum(sr => sr.Strokes);

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteScorecardAsync(int id)
        {
            var scorecard = await _db.Scorecards.FindAsync(id);
            if (scorecard == null) return Result<bool>.Failure(new Error("ScorecardNotFound", "Scorecard not found."));

            _db.Scorecards.Remove(scorecard);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }
    }
}
