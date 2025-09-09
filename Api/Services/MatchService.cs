using Api.Data;
using Api.Models;
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
    }
}
