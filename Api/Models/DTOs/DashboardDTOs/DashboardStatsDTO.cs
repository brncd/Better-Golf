namespace Api.Models.DTOs.DashboardDTOs;

public class DashboardStatsDTO
{
    public int TotalTournaments { get; set; }
    public int ActiveTournaments { get; set; }
    public int TotalPlayers { get; set; }
    public int TotalCourses { get; set; }
    public int CompletedTournaments { get; set; }
    public int UpcomingTournaments { get; set; }
    public double AveragePlayersPerTournament { get; set; }
    public int TotalRoundsPlayed { get; set; }
}
