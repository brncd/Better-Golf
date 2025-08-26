using Api.Data;
using Api.Models;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs; // Added
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

        public async Task<SinglePLayerDTO?> GetPlayerByIdAsync(int id)
        {
            var player = await _db.Players.FindAsync(id);
            return player == null ? null : new SinglePLayerDTO(player);
        }

        public async Task<Result<SinglePLayerDTO>> CreatePlayerAsync(PLayerPostDTO playerDto)
        {
            var existingPlayer = await _db.Players.FirstOrDefaultAsync(x => x.MatriculaAUG == playerDto.MatriculaAUG);
            if (existingPlayer != null)
            {
                return Result<SinglePLayerDTO>.Failure(new Error("PlayerAlreadyExists", "Ya existe un jugador con la misma MatriculaAUG"));
            }

            var player = new Player(playerDto);
            _db.Players.Add(player);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Player {player.Id} created.");

            return Result<SinglePLayerDTO>.Success(new SinglePLayerDTO(player));
        }

        public async Task<Result<bool>> UpdatePlayerAsync(int id, PLayerPostDTO playerDto)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null)
            {
                return Result<bool>.Failure(new Error("PlayerNotFound", "Player not found."));
            }

            player.MatriculaAUG = playerDto.MatriculaAUG;
            player.Name = playerDto.Name;
            player.LastName = playerDto.LastName;
            player.HandicapIndex = playerDto.HandicapIndex;
            player.Birthdate = playerDto.Birthdate;
            player.IsPreferredCategoryLadies = playerDto.IsPreferredCategoryLadies;

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
    }
}
