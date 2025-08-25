using Api.Data;
using Api.Models;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs; // Added
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;

namespace Api.Services
{
    public class PlayerService
    {
        private readonly BgContext _db;

        public PlayerService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<PlayerListGetDTO>> GetAllPlayersAsync()
        {
            return await _db.Players.Select(p => new PlayerListGetDTO(p)).ToListAsync();
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
            return Result<bool>.Success(true);
        }

        public async Task<List<TournamentListGetDTO>> GetPlayerTournamentsAsync(int playerId)
        {
            var player = await _db.Players.Include(p => p.Tournaments).FirstOrDefaultAsync(item => item.Id == playerId);
            if (player == null) return new List<TournamentListGetDTO>();

            var dtosList = new List<TournamentListGetDTO>();
            foreach (var tournament in player.Tournaments)
            {
                dtosList.Add(new TournamentListGetDTO(tournament));
            }
            return dtosList;
        }
    }
}
