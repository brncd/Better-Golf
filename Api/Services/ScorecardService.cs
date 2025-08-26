using Api.Data;
using Api.Models;
using Api.Models.DTOs.ScorecardDTOs;
using Api.Services; // Added
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Api.Models.Common;

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

        public async Task<Result<PaginationResponse<ScorecardListGetDTO>>> GetAllScorecardsAsync(int tournamentId, PaginationRequest pagination)
        {
            var tournament = await _db.Tournaments.Include(t => t.Scorecards).FirstOrDefaultAsync(t => t.Id == tournamentId);
            if (tournament == null) return Result<PaginationResponse<ScorecardListGetDTO>>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var query = tournament.Scorecards.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(sc => new ScorecardListGetDTO(sc))
                                   .ToListAsync();
            return Result<PaginationResponse<ScorecardListGetDTO>>.Success(new PaginationResponse<ScorecardListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items));
        }

        public async Task<SingleScorecardDTO?> GetScorecardByIdAsync(int id)
        {
            var scorecard = await _db.Scorecards.Include(s => s.ScorecardResults).FirstOrDefaultAsync(s => s.Id == id);
            return scorecard == null ? null : new SingleScorecardDTO(scorecard);
        }

        public async Task<SingleScorecardDTO> CreateScorecardAsync(ScorecardPostDTO scorecardDto)
        {
            var scorecard = new Scorecard
            {
                PlayingHandicap = scorecardDto.PlayingHandicap,
                PlayerId = scorecardDto.PlayerId,
                TournamentId = scorecardDto.TournamentId,
                ScorecardResults = new List<ScorecardResult>(),
                IsLocked = false // Set IsLocked to false by default
            };

            foreach (var holeResultDto in scorecardDto.ScorecardResults)
            {
                scorecard.ScorecardResults.Add(new ScorecardResult
                {
                    Strokes = holeResultDto.Strokes,
                    HoleId = holeResultDto.HoleId,
                    RoundNumber = holeResultDto.RoundNumber
                });
            }

            _db.Scorecards.Add(scorecard);
            await _db.SaveChangesAsync();
            return new SingleScorecardDTO(scorecard);
        }

        public async Task<Result<bool>> UpdateScorecardAsync(int id, ScorecardPostDTO inputScorecardDto)
        {
            var scorecard = await _db.Scorecards.Include(s => s.ScorecardResults).FirstOrDefaultAsync(s => s.Id == id);
            if (scorecard == null) return Result<bool>.Failure(new Error("ScorecardNotFound", "Scorecard not found."));

            if (scorecard.IsLocked)
            {
                return Result<bool>.Failure(new Error("ScorecardLocked", "Scorecard is locked and cannot be updated."));
            }

            scorecard.PlayingHandicap = inputScorecardDto.PlayingHandicap;

            // Update existing ScorecardResults
            foreach (var inputResult in inputScorecardDto.ScorecardResults)
            {
                var existingResult = scorecard.ScorecardResults.FirstOrDefault(sr => sr.HoleId == inputResult.HoleId);
                if (existingResult != null)
                {
                    existingResult.Strokes = inputResult.Strokes;
                    existingResult.RoundNumber = inputResult.RoundNumber;
                }
                else
                {
                    // Add new scorecard results if they don't exist
                    scorecard.ScorecardResults.Add(new ScorecardResult
                    {
                        Strokes = inputResult.Strokes,
                        HoleId = inputResult.HoleId,
                        RoundNumber = inputResult.RoundNumber
                    });
                }
            }

            // Remove scorecard results that are no longer present in the input
            var resultsToRemove = scorecard.ScorecardResults
                .Where(sr => !inputScorecardDto.ScorecardResults.Any(ir => ir.HoleId == sr.HoleId))
                .ToList();
            foreach (var result in resultsToRemove)
            {
                _db.ScorecardResults.Remove(result);
            }

            // Recalculate TotalStrokes
            scorecard.TotalStrokes = scorecard.ScorecardResults.Sum(sr => sr.Strokes);

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> LockScorecardAsync(int id)
        {
            var scorecard = await _db.Scorecards.FindAsync(id);
            if (scorecard == null) return Result<bool>.Failure(new Error("ScorecardNotFound", "Scorecard not found."));

            if (scorecard.IsLocked)
            {
                return Result<bool>.Failure(new Error("ScorecardAlreadyLocked", "Scorecard is already locked."));
            }

            scorecard.IsLocked = true;
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