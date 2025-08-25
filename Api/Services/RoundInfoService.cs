using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Api.Models.Common;

namespace Api.Services
{
    public class RoundInfoService
    {
        private readonly BgContext _db;

        public RoundInfoService(BgContext db)
        {
            _db = db;
        }

        public async Task<PaginationResponse<RoundInfo>> GetAllRoundInfoAsync(PaginationRequest pagination)
        {
            var query = _db.RoundInfos.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .ToListAsync();
            return new PaginationResponse<RoundInfo>(pagination.PageNumber, pagination.PageSize, totalCount, items);
        }

        public async Task<RoundInfo?> GetRoundInfoAsync(int id)
        {
            return await _db.RoundInfos.FindAsync(id);
        }

        public async Task<RoundInfo> CreateRoundInfoAsync(RoundInfo roundInfo)
        {
            _db.RoundInfos.Add(roundInfo);
            await _db.SaveChangesAsync();
            return roundInfo;
        }

        public async Task<Result<bool>> UpdateRoundInfoAsync(int id, RoundInfo inputRoundInfo)
        {
            var roundInfo = await _db.RoundInfos.FindAsync(id);

            if (roundInfo == null) return Result<bool>.Failure(new Error("RoundInfoNotFound", "Round info not found."));

            roundInfo.Interval = inputRoundInfo.Interval;
            roundInfo.FirstRoundTime = inputRoundInfo.FirstRoundTime;
            roundInfo.IsShotgun = inputRoundInfo.IsShotgun;

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteRoundInfoAsync(int id)
        {
            var roundInfo = await _db.RoundInfos.FindAsync(id);
            if (roundInfo == null) return Result<bool>.Failure(new Error("RoundInfoNotFound", "Round info not found."));

            _db.RoundInfos.Remove(roundInfo);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }
    }
}
