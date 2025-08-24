using Api.Data;
using Api.Models;
using Api.Models.DTOs.ResultDTOs;
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
            var rankings = await _db.Scorecards.Where(scorecard => scorecard.TournamentId == tournamentId)
                .GroupBy(scorecard => scorecard.PlayerId)
                .Select(group => new TournamentRankingDTO
                {
                    TournamentId = tournamentId,
                    PlayerId = group.Key,
                    TotalStrokes = group.Sum(scorecard => scorecard.TotalStrokes)
                })
                .OrderBy(ranking => ranking.TotalStrokes).ToListAsync();

            // Clear existing rankings for this tournament before adding new ones
            var existingRankings = await _db.TournamentRankings.Where(r => r.TournamentId == tournamentId).ToListAsync();
            _db.TournamentRankings.RemoveRange(existingRankings);
            await _db.SaveChangesAsync();

            foreach (var rankingDto in rankings)
            {
                _db.TournamentRankings.Add(new TournamentRanking
                {
                    TournamentId = rankingDto.TournamentId,
                    PlayerId = rankingDto.PlayerId,
                    TotalStrokes = rankingDto.TotalStrokes
                });
            }
            await _db.SaveChangesAsync();

            return rankings;
        }

        public async Task<List<TournamentRankingDTO>> GetTournamentRankingAsync(int tournamentId)
        {
            return await _db.TournamentRankings.Where(ranking => ranking.TournamentId == tournamentId)
                .OrderBy(r => r.TotalStrokes)
                .Select(r => new TournamentRankingDTO
                {
                    Position = r.Position,
                    TournamentId = r.TournamentId,
                    PlayerId = r.PlayerId,
                    TotalStrokes = r.TotalStrokes
                })
                .ToListAsync();
        }
    }
}