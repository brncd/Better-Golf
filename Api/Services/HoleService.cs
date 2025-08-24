using Api.Data;
using Api.Models;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class HoleService
    {
        private readonly BgContext _db;

        public HoleService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<HoleListGetDTO>> GetAllHolesAsync()
        {
            return await _db.Holes.Select(h => new HoleListGetDTO(h)).ToListAsync();
        }

        public async Task<SingleHoleDTO?> GetHoleByIdAsync(int id)
        {
            var hole = await _db.Holes.FindAsync(id);
            return hole == null ? null : new SingleHoleDTO(hole);
        }

        public async Task<SingleHoleDTO> CreateHoleAsync(HolePostDTO holeDto)
        {
            var hole = new Hole(holeDto);
            _db.Holes.Add(hole);
            await _db.SaveChangesAsync();
            return new SingleHoleDTO(hole);
        }

        public async Task<bool> UpdateHoleAsync(int id, HolePostDTO holeDto)
        {
            var hole = await _db.Holes.FindAsync(id);
            if (hole == null) return false;

            hole.Par = holeDto.Par;
            hole.Number = holeDto.Number;
            hole.StrokeIndex = holeDto.StrokeIndex;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteHoleAsync(int id)
        {
            var hole = await _db.Holes.FindAsync(id);
            if (hole == null) return false;

            _db.Holes.Remove(hole);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
