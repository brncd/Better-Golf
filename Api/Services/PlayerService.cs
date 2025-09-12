using Api.Data;
using Api.Models;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs;
using Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Api.Models.Common;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class PlayerService
    {
        private readonly BgContext _db;
        private readonly ILogger<PlayerService> _logger;

        public PlayerService(BgContext db, ILogger<PlayerService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<PaginationResponse<PlayerListGetDTO>> GetAllPlayersAsync(PaginationRequest pagination)
        {
            var query = _db.Players.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(p => new PlayerListGetDTO(p))
                                   .ToListAsync();
            return new PaginationResponse<PlayerListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items);
        }

        public async Task<SinglePlayerDTO?> GetPlayerByIdAsync(int id)
        {
            var player = await _db.Players.FindAsync(id);
            return player == null ? null : new SinglePlayerDTO(player);
        }

        public async Task<Result<SinglePlayerDTO>> CreatePlayerAsync(PlayerPostDTO playerDto)
        {
            var existingPlayer = await _db.Players.FirstOrDefaultAsync(x => x.MatriculaAUG == int.Parse(playerDto.MembershipNumber));
            if (existingPlayer != null)
            {
                return Result<SinglePlayerDTO>.Failure(new Error("PlayerAlreadyExists", "Ya existe un jugador con la misma MatriculaAUG"));
            }

            var player = new Player(playerDto);
            _db.Players.Add(player);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Player {player.Id} created.");

            return Result<SinglePlayerDTO>.Success(new SinglePlayerDTO(player));
        }

        public async Task<Result<SinglePlayerDTO>> CreatePlayerForUserAsync(string userId, PlayerPostDTO playerDto)
        {
            var existingPlayer = await _db.Players.FirstOrDefaultAsync(p => p.ApplicationUserId == userId);
            if (existingPlayer != null)
            {
                return Result<SinglePlayerDTO>.Failure(new Error("PlayerProfileAlreadyExists", "This user already has a player profile."));
            }

            var player = new Player(playerDto)
            {
                ApplicationUserId = userId
            };

            _db.Players.Add(player);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Player profile created for user {userId}.");

            return Result<SinglePlayerDTO>.Success(new SinglePlayerDTO(player));
        }

        public async Task<Result<bool>> UpdatePlayerAsync(int id, PlayerPostDTO playerDto)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null)
            {
                return Result<bool>.Failure(new Error("PlayerNotFound", "Player not found."));
            }

            player.MatriculaAUG = int.Parse(playerDto.MembershipNumber);
            player.Name = playerDto.FirstName;
            player.LastName = playerDto.LastName;
            player.Email = playerDto.Email;
            player.PhoneNumber = playerDto.PhoneNumber;
            player.HandicapIndex = playerDto.Handicap;
            player.Birthdate = DateOnly.Parse(playerDto.DateOfBirth);
            player.IsPreferredCategoryLadies = playerDto.Gender.ToLower() == "female";

            await _db.SaveChangesAsync();
            _logger.LogInformation($"Player {id} updated.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeletePlayerAsync(int id)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null)
            {
                return Result<bool>.Failure(new Error("PlayerNotFound", "Player not found."));
            }

            _db.Players.Remove(player);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Player {id} deleted.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<PaginationResponse<TournamentListGetDTO>>> GetPlayerTournamentsAsync(int playerId, PaginationRequest pagination)
        {
            var player = await _db.Players.Include(p => p.Tournaments).FirstOrDefaultAsync(item => item.Id == playerId);
            if (player == null) return Result<PaginationResponse<TournamentListGetDTO>>.Failure(new Error("PlayerNotFound", "Player not found."));

            var query = player.Tournaments.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(t => new TournamentListGetDTO(t))
                                   .ToListAsync();
            return Result<PaginationResponse<TournamentListGetDTO>>.Success(new PaginationResponse<TournamentListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items));
        }

        public async Task<Result<PlayerTournamentHistoryListDTO>> GetPlayerTournamentHistoryAsync(int playerId)
        {
            var player = await _db.Players
            .Include(p => p.Tournaments)
                .ThenInclude(t => t.Rounds)
            .FirstOrDefaultAsync(p => p.Id == playerId);

            if (player == null)
            {
                return Result<PlayerTournamentHistoryListDTO>.Failure(new Error("PlayerNotFound", "Player not found."));
            }

            var tournamentHistory = new List<PlayerTournamentHistoryDTO>();
            int wonTournaments = 0;
            int top3Finishes = 0;
            var totalScores = new List<int>();

            foreach (var tournament in player.Tournaments)
            {
                // Get scorecards for this player in this tournament
                var scorecards = await _db.Scorecards
                    .Where(sc => sc.PlayerId == playerId && sc.TournamentId == tournament.Id)
                    .ToListAsync();

                var totalScore = scorecards.Sum(sc => sc.TotalStrokes);
                var stablefordPoints = 0; // Calculate if needed
                var roundsPlayed = scorecards.Count;

                // Calculate position (simplified - would need proper leaderboard calculation)
                var allScores = await _db.Scorecards
                    .Where(sc => sc.TournamentId == tournament.Id)
                    .GroupBy(sc => sc.PlayerId)
                    .Select(g => new { PlayerId = g.Key, TotalScore = g.Sum(sc => sc.TotalStrokes) })
                    .OrderBy(x => x.TotalScore)
                    .ToListAsync();

                var position = allScores.FindIndex(x => x.PlayerId == playerId) + 1;
                int? finalPosition = position == 0 ? null : position;

                if (position == 1) wonTournaments++;
                if (position <= 3 && position > 0) top3Finishes++;

                if (totalScore > 0) totalScores.Add(totalScore);

                var historyItem = new PlayerTournamentHistoryDTO
                {
                    TournamentId = tournament.Id,
                    TournamentName = tournament.Name,
                    TournamentType = tournament.TournamentType.ToString(),
                    StartDate = tournament.StartDate.ToDateTime(TimeOnly.MinValue),
                    EndDate = tournament.EndDate.ToDateTime(TimeOnly.MinValue),
                    Status = tournament.Status.ToString(),
                    Position = finalPosition,
                    TotalScore = totalScore > 0 ? totalScore : null,
                    StablefordPoints = stablefordPoints > 0 ? stablefordPoints : null,
                    RoundsPlayed = roundsPlayed,
                    TotalRounds = tournament.Rounds?.Count ?? 0,
                    RegistrationDate = DateTime.UtcNow // Would need actual registration date from junction table
                };

                tournamentHistory.Add(historyItem);
            }

            var result = new PlayerTournamentHistoryListDTO
            {
                PlayerId = player.Id,
                PlayerName = $"{player.Name} {player.LastName}",
                Tournaments = tournamentHistory.OrderByDescending(t => t.StartDate).ToList(),
                TotalTournaments = player.Tournaments.Count,
                CompletedTournaments = player.Tournaments.Count(t => t.Status == TournamentStatus.Completed),
                WonTournaments = wonTournaments,
                Top3Finishes = top3Finishes,
                AverageScore = totalScores.Any() ? totalScores.Average() : 0
            };

            return Result<PlayerTournamentHistoryListDTO>.Success(result);
        }
    }
}
