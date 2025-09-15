using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Models;

public class RoundInfo
{
    public int Id { get; set; }
    public int Interval { get; set; }
    public int FirstRoundTime { get; set; }
    public int EndTime { get; set; }
    public int MaxPlayersPerGroup { get; set; }
    public bool IsShotgun { get; set; }

        public RoundInfo(int interval, int firstRoundTime, int endTime, int maxPlayersPerGroup, bool isShotgun)
    {
        Interval = interval;
        FirstRoundTime = firstRoundTime;
        EndTime = endTime;
        MaxPlayersPerGroup = maxPlayersPerGroup;
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
    
}