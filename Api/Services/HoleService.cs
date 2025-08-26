using Api.Data;
using Api.Models;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Api.Models.Common;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class HoleService
    {
        private readonly BgContext _db;
        private readonly ILogger<HoleService> _logger;

        public HoleService(BgContext db, ILogger<HoleService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<PaginationResponse<HoleListGetDTO>> GetAllHolesAsync(PaginationRequest pagination)
        {
            var query = _db.Holes.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(h => new HoleListGetDTO(h))
                                   .ToListAsync();
            return new PaginationResponse<HoleListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items);
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
            _logger.LogInformation($"Hole {hole.Id} created.");
            return new SingleHoleDTO(hole);
        }

        public async Task<Result<bool>> UpdateHoleAsync(int id, HolePostDTO holeDto)
        {
            var hole = await _db.Holes.FindAsync(id);
            if (hole == null) return Result<bool>.Failure(new Error("HoleNotFound", "Hole not found."));

            hole.Par = holeDto.Par;
            hole.Number = holeDto.Number;
            hole.StrokeIndex = holeDto.StrokeIndex;

            await _db.SaveChangesAsync();
            _logger.LogInformation($"Hole {id} updated.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteHoleAsync(int id)
        {
            var hole = await _db.Holes.FindAsync(id);
            if (hole == null) return Result<bool>.Failure(new Error("HoleNotFound", "Hole not found."));

            _db.Holes.Remove(hole);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Hole {id} deleted.");
            return Result<bool>.Success(true);
        }
    }
}
