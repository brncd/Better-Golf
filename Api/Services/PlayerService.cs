using Api.Data;
using Api.Models;
using Api.Models.DTOs.PlayerDTOs;
using Microsoft.EntityFrameworkCore;

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

        public async Task<(SinglePLayerDTO?, string?)> CreatePlayerAsync(PLayerPostDTO playerDto)
        {
            var existingPlayer = await _db.Players.FirstOrDefaultAsync(x => x.MatriculaAUG == playerDto.MatriculaAUG);
            if (existingPlayer != null)
            {
                return (null, "Ya existe un jugador con la misma MatriculaAUG");
            }

            var player = new Player(playerDto);
            _db.Players.Add(player);
            await _db.SaveChangesAsync();

            return (new SinglePLayerDTO(player), null);
        }

        public async Task<bool> UpdatePlayerAsync(int id, PLayerPostDTO playerDto)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null)
            {
                return false;
            }

            player.MatriculaAUG = playerDto.MatriculaAUG;
            player.Name = playerDto.Name;
            player.LastName = playerDto.LastName;
            player.HandicapIndex = playerDto.HandicapIndex;
            player.Birthdate = playerDto.Birthdate;
            player.IsPreferredCategoryLadies = playerDto.IsPreferredCategoryLadies;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePlayerAsync(int id)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null)
            {
                return false;
            }

            _db.Players.Remove(player);
            await _db.SaveChangesAsync();
            return true;
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
