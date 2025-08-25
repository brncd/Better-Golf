using Api.Data;
using Api.Models;
using Api.Models.DTOs.ScorecardResultDTOs;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;

namespace Api.Services
{
    public class ScorecardResultService
    {
        private readonly BgContext _db;

        public ScorecardResultService(BgContext db)
        {
            _db = db;
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

            scorecardresult.Strokes = inputScorecardResult.Strokes;
            await _db.SaveChangesAsync();

            if (scorecardresult.Scorecard != null && scorecardresult.Scorecard.ScorecardResults != null)
            {
                scorecardresult.Scorecard.TotalStrokes = scorecardresult.Scorecard.ScorecardResults.Sum(result => result.Strokes);
            }

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteScorecardResultAsync(int id)
        {
            var scorecardresult = await _db.ScorecardResults.FindAsync(id);
            if (scorecardresult == null) return Result<bool>.Failure(new Error("ScorecardResultNotFound", "Scorecard result not found."));

            _db.ScorecardResults.Remove(scorecardresult);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }
    }
}
