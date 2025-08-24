using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

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

        public async Task<bool> UpdateRoundInfoAsync(int id, RoundInfo inputRoundInfo)
        {
            var roundInfo = await _db.RoundInfos.FindAsync(id);

            if (roundInfo == null) return false;

            roundInfo.Interval = inputRoundInfo.Interval;
            roundInfo.FirstRoundTime = inputRoundInfo.FirstRoundTime;
            roundInfo.IsShotgun = inputRoundInfo.IsShotgun;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoundInfoAsync(int id)
        {
            var roundInfo = await _db.RoundInfos.FindAsync(id);
            if (roundInfo == null) return false;

            _db.RoundInfos.Remove(roundInfo);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
