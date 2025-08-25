using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;

namespace Api.Services
{
    public class RoundInfoService
    {
        private readonly BgContext _db;

        public RoundInfoService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<RoundInfo>> GetAllRoundInfoAsync()
        {
            return await _db.RoundInfos.ToListAsync();
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
