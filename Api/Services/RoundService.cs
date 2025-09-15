
using Api.Data;
using Api.Models;
using Api.Models.DTOs.RoundDTOs;
using Api.Models.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class RoundService
    {
        private readonly BgContext _db;
        private readonly ILogger<RoundService> _logger;

        public RoundService(BgContext db, ILogger<RoundService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<Result<bool>> CreateRoundsForTournament(int tournamentId)
        {
            var tournament = await _db.Tournaments.Include(t => t.Rounds).FirstOrDefaultAsync(t => t.Id == tournamentId);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            if (tournament.Rounds.Any())
            {
                return Result<bool>.Failure(new Error("RoundsAlreadyExist", "Rounds for this tournament have already been created."));
            }

            var rounds = new List<Round>();
            var roundNumber = 1;
            for (var date = tournament.StartDate; date <= tournament.EndDate; date = date.AddDays(1))
            {
                rounds.Add(new Round
                {
                    TournamentId = tournamentId,
                    RoundNumber = roundNumber++,
                    Date = date
                });
            }

            await _db.Rounds.AddRangeAsync(rounds);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"{rounds.Count} rounds created for tournament {tournamentId}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<TeeTimeDTO>>> GenerateTeeTimes(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .Include(t => t.Rounds)
                .Include(t => t.RoundInfo)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<List<TeeTimeDTO>>.Failure(new Error("TournamentNotFound", "Tournament not found."));
            if (tournament.RoundInfo == null) return Result<List<TeeTimeDTO>>.Failure(new Error("RoundInfoMissing", "Tournament is missing RoundInfo."));
            if (!tournament.Players.Any()) return Result<List<TeeTimeDTO>>.Failure(new Error("NoPlayersInTournament", "No players are registered for this tournament."));
            if (!tournament.Rounds.Any()) return Result<List<TeeTimeDTO>>.Failure(new Error("NoRoundsForTournament", "No rounds have been created for this tournament. Please create rounds first."));

            // Clear existing tee times for this tournament
            var existingPlayerRounds = await _db.PlayerRounds.Where(pr => pr.Round.TournamentId == tournamentId).ToListAsync();
            _db.PlayerRounds.RemoveRange(existingPlayerRounds);
            await _db.SaveChangesAsync();

            var playerRounds = new List<PlayerRound>();

            foreach (var round in tournament.Rounds.OrderBy(r => r.RoundNumber))
            {
                var players = tournament.Players.ToList(); // Use a copy for each round
                if (tournament.RoundInfo.IsShotgun)
                {
                    // Shotgun start logic
                    int holeNumber = 1;
                    foreach (var player in players)
                    {
                        playerRounds.Add(new PlayerRound
                        {
                            PlayerId = player.Id,
                            RoundId = round.Id,
                            TeeTime = new TimeSpan(tournament.RoundInfo.FirstRoundTime, 0, 0),
                            StartingHole = holeNumber++
                        });
                        if (holeNumber > 18) holeNumber = 1; // Assuming 18 holes
                    }
                }
                else
                {
                    // Standard tee time logic
                    var currentTime = new TimeSpan(tournament.RoundInfo.FirstRoundTime, 0, 0);
                    foreach (var player in players)
                    {
                        playerRounds.Add(new PlayerRound
                        {
                            PlayerId = player.Id,
                            RoundId = round.Id,
                            TeeTime = currentTime,
                            StartingHole = 1
                        });
                        currentTime = currentTime.Add(new TimeSpan(0, tournament.RoundInfo.Interval, 0));
                    }
                }
            }

            await _db.PlayerRounds.AddRangeAsync(playerRounds);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Tee times generated for tournament {tournamentId}.");

            var resultDto = await _db.PlayerRounds
                .Where(pr => pr.Round.TournamentId == tournamentId)
                .Include(pr => pr.Player)
                .Include(pr => pr.Round)
                .Select(pr => new TeeTimeDTO(pr))
                .ToListAsync();

            return Result<List<TeeTimeDTO>>.Success(resultDto);
        }

        public async Task<Result<List<TeeTimeDTO>>> GetTeeTimes(int tournamentId)
        {
            var teeTimes = await _db.PlayerRounds
                .Where(pr => pr.Round.TournamentId == tournamentId)
                .Include(pr => pr.Player)
                .Include(pr => pr.Round)
                .OrderBy(pr => pr.Round.RoundNumber).ThenBy(pr => pr.TeeTime).ThenBy(pr => pr.StartingHole)
                .Select(pr => new TeeTimeDTO(pr))
                .ToListAsync();

            if (!teeTimes.Any())
            {
                return Result<List<TeeTimeDTO>>.Failure(new Error("NoTeeTimes", "No tee times have been generated for this tournament."));
            }

            return Result<List<TeeTimeDTO>>.Success(teeTimes);
        }

        public async Task<Result<List<RoundDTO>>> GetTournamentRoundsAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments.Include(t => t.Rounds).FirstOrDefaultAsync(t => t.Id == tournamentId);
            if (tournament == null) return Result<List<RoundDTO>>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var rounds = tournament.Rounds.OrderBy(r => r.RoundNumber).Select(r => new RoundDTO(r)).ToList();
            return Result<List<RoundDTO>>.Success(rounds);
        }

        public async Task<Result<TeeTimeDTO>> UpdateTeeTime(int roundId, int playerId, TimeSpan newTeeTime, int newStartingHole)
        {
            var playerRound = await _db.PlayerRounds
                .Include(pr => pr.Player)
                .Include(pr => pr.Round)
                .FirstOrDefaultAsync(pr => pr.RoundId == roundId && pr.PlayerId == playerId);

            if (playerRound == null)
            {
                return Result<TeeTimeDTO>.Failure(new Error("PlayerRoundNotFound", "The specified player is not scheduled for this round."));
            }

            playerRound.TeeTime = newTeeTime;
            playerRound.StartingHole = newStartingHole;

            await _db.SaveChangesAsync();
            _logger.LogInformation($"Tee time updated for player {playerId} in round {roundId}.");

            return Result<TeeTimeDTO>.Success(new TeeTimeDTO(playerRound));
        }
    }
}
