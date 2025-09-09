using Api.Data;
using Api.Models;
using Api.Models.DTOs.MatchDTOs;
using Api.Models.Engine;
using Api.Models.Enums;
using Api.Models.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class MatchService
    {
        private readonly BgContext _db;
        private readonly ILogger<MatchService> _logger;

        public MatchService(BgContext db, ILogger<MatchService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<Result<bool>> GenerateMatchesAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));
            if (tournament.TournamentType != TournamentType.MatchPlay) return Result<bool>.Failure(new Error("InvalidTournamentType", "This tournament is not a Match Play tournament."));
            if (tournament.Players.Count < 2) return Result<bool>.Failure(new Error("NotEnoughPlayers", "At least two players are required to generate matches."));

            var existingMatches = await _db.Matches.AnyAsync(m => m.TournamentId == tournamentId);
            if (existingMatches) return Result<bool>.Failure(new Error("MatchesAlreadyExist", "Matches have already been generated for this tournament."));

            // Simple sequential pairing. A real implementation might use seeding by handicap.
            var players = tournament.Players.ToList();
            var matches = new List<Match>();

            for (int i = 0; i < players.Count / 2; i++)
            {
                var player1 = players[i * 2];
                var player2 = players[i * 2 + 1];

                matches.Add(new Match
                {
                    TournamentId = tournamentId,
                    Player1Id = player1.Id,
                    Player2Id = player2.Id,
                    Status = MatchStatus.NotStarted
                });
            }

            await _db.Matches.AddRangeAsync(matches);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"{matches.Count} matches generated for tournament {tournamentId}.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<List<MatchDTO>>> GetMatchesForTournamentAsync(int tournamentId)
        {
            var matches = await _db.Matches
                .Where(m => m.TournamentId == tournamentId)
                .Include(m => m.Player1)
                .Include(m => m.Player2)
                .Include(m => m.WinningPlayer)
                .ToListAsync();

            if (!matches.Any())
            {
                return Result<List<MatchDTO>>.Failure(new Error("NoMatchesFound", "No matches have been generated for this tournament."));
            }

            return Result<List<MatchDTO>>.Success(matches.Select(m => new MatchDTO(m)).ToList());
        }

        public async Task<Result<MatchDTO>> RecordHoleResultAsync(int matchId, int holeId, int? winningPlayerId)
        {
            var match = await _db.Matches
                .Include(m => m.HoleResults)
                .Include(m => m.Player1)
                .Include(m => m.Player2)
                .Include(m => m.WinningPlayer)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (match == null) return Result<MatchDTO>.Failure(new Error("MatchNotFound", "Match not found."));
            if (match.Status == MatchStatus.Completed) return Result<MatchDTO>.Failure(new Error("MatchCompleted", "This match has already been completed."));
            if (winningPlayerId.HasValue && winningPlayerId != match.Player1Id && winningPlayerId != match.Player2Id)
            {
                return Result<MatchDTO>.Failure(new Error("InvalidWinner", "The winning player is not part of this match."));
            }

            var holeResult = match.HoleResults.FirstOrDefault(hr => hr.HoleId == holeId);
            if (holeResult != null)
            {
                // Update existing result
                holeResult.WinningPlayerId = winningPlayerId;
            }
            else
            {
                // Add new result
                match.HoleResults.Add(new MatchHoleResult
                {
                    HoleId = holeId,
                    WinningPlayerId = winningPlayerId
                });
            }

            // Recalculate match state
            ResultsEngine.UpdateMatchState(match, match.HoleResults);

            await _db.SaveChangesAsync();
            _logger.LogInformation($"Result for hole {holeId} in match {matchId} recorded. New score: {match.Result}");

            return Result<MatchDTO>.Success(new MatchDTO(match));
        }
    }
}
