using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Models;

public class RoundInfo
{
    public int Id { get; set; }
    public int Interval { get; set; }
    public int FirstRoundTime { get; set; }
    public bool IsShotgun { get; set; }

    public RoundInfo(int interval, int firstRoundTime, bool isShotgun)
    {
        Interval = interval;
        FirstRoundTime = firstRoundTime;
        IsShotgun = isShotgun;
    }
    public override bool Equals(object? obj)
    {
        if (obj is RoundInfo roundinfo)
        {
            return Id == roundinfo.Id;
        }
        return false;
    }
    public RoundInfo() 
    {
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $"Id: {Id}, Interval: {Interval}, First Round Time {FirstRoundTime}";
    }
    public static async Task<IResult> GetAllRoundInfo(BgContext db)
    {
        return Results.Ok(await db.RoundInfos.ToArrayAsync());
    }
    public static async Task<IResult> GetRoundInfo(int id, BgContext db)
    {
        var roundinfo = await db.RoundInfos.FindAsync(id);
        if (roundinfo == null) { return Results.NotFound(); }

        return Results.Ok(roundinfo);
    }
    public static async Task<IResult> CreateRoundInfo(BgContext db, RoundInfo roundinfo)
    {
        db.RoundInfos.Add(roundinfo);
        await db.SaveChangesAsync();

        return Results.Created($"/RoundsInfo/{roundinfo.Id}", roundinfo);
    }
    public static async Task<IResult> UpdateRoundInfo(int id, BgContext db, RoundInfo inputRoundInfo)
    {
        var roundinfo = await db.RoundInfos.FindAsync(id);

        if (roundinfo == null)
        {
            return Results.NotFound();
        }

        roundinfo.Interval = inputRoundInfo.Interval;
        roundinfo.FirstRoundTime = inputRoundInfo.FirstRoundTime;
        roundinfo.IsShotgun = inputRoundInfo.IsShotgun;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> DeleteRoundInfo(int id, BgContext db)
    {
        var roundifo = await db.RoundInfos.FindAsync(id);
        if (roundifo == null) { return Results.NotFound(); }

        db.RoundInfos.Remove(roundifo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}

