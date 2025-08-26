using Api.Data;
using Api.Models;
using Api.Models.DTOs.ScorecardResultDTOs;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class ScorecardResultService
    {
        private readonly BgContext _db;
        private readonly ILogger<ScorecardResultService> _logger;

        public ScorecardResultService(BgContext db, ILogger<ScorecardResultService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<SingleScorecardResultDTO?> GetScorecardResultAsync(int scorecardId, int holeId)
        {
            var scorecardresult = await _db.ScorecardResults.Include(x => x.Scorecard)
                .ThenInclude(x => x.ScorecardResults).Include(x => x.Hole)
                .FirstOrDefaultAsync(x => x.ScorecardId == scorecardId && x.HoleId == holeId);

            return scorecardresult == null ? null : new SingleScorecardResultDTO(scorecardresult);
        }

        public async Task<Result<bool>> UpdateScorecardResultAsync(int scorecardId, int holeId, ScorecardResultPostDTO inputScorecardResult)
        {
            var scorecardresult = await _db.ScorecardResults.Include(x => x.Scorecard)
                .ThenInclude(x => x.ScorecardResults).Include(x => x.Hole)
                .FirstOrDefaultAsync(x => x.ScorecardId == scorecardId && x.HoleId == holeId);

            if (scorecardresult == null) return Result<bool>.Failure(new Error("ScorecardResultNotFound", "Scorecard result not found."));

            // Check if the associated scorecard is locked
            if (scorecardresult.Scorecard != null && scorecardresult.Scorecard.IsLocked)
            {
                return Result<bool>.Failure(new Error("ScorecardLocked", "Scorecard is locked and cannot be updated."));
            }

            scorecardresult.Strokes = inputScorecardResult.Strokes;
            await _db.SaveChangesAsync();

            if (scorecardresult.Scorecard != null && scorecardresult.Scorecard.ScorecardResults != null)
            {
                scorecardresult.Scorecard.TotalStrokes = scorecardresult.Scorecard.ScorecardResults.Sum(result => result.Strokes);
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation($"ScorecardResult for scorecard {scorecardId} and hole {holeId} updated.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteScorecardResultAsync(int id)
        {
            var scorecardresult = await _db.ScorecardResults.FindAsync(id);
            if (scorecardresult == null) return Result<bool>.Failure(new Error("ScorecardResultNotFound", "Scorecard result not found."));

            _db.ScorecardResults.Remove(scorecardresult);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"ScorecardResult {id} deleted.");
            return Result<bool>.Success(true);
        }
    }
}