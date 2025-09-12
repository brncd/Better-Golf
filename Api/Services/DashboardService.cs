using Api.Data;
using Api.Models.DTOs.DashboardDTOs;
using Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class DashboardService
{
    private readonly BgContext _context;

    public DashboardService(BgContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDTO> GetDashboardStatsAsync()
    {
        var totalTournaments = await _context.Tournaments.CountAsync();
        var activeTournaments = await _context.Tournaments
            .CountAsync(t => t.Status == TournamentStatus.OpenRegistration || t.Status == TournamentStatus.InProgress);
        var totalPlayers = await _context.Players.CountAsync();
        var totalCourses = await _context.Courses.CountAsync();
        var completedTournaments = await _context.Tournaments
            .CountAsync(t => t.Status == TournamentStatus.Completed);
        var upcomingTournaments = await _context.Tournaments
            .CountAsync(t => t.Status == TournamentStatus.OpenRegistration);

        // Calculate average players per tournament
        var tournamentsWithPlayers = await _context.Tournaments
            .Include(t => t.Players)
            .Where(t => t.Players.Any())
            .ToListAsync();
        
        var averagePlayersPerTournament = tournamentsWithPlayers.Any() 
            ? tournamentsWithPlayers.Average(t => t.Players.Count) 
            : 0;

        // Calculate total rounds played
        var totalRoundsPlayed = await _context.PlayerRounds
            .CountAsync(pr => pr.TeeTime != null); // Only count rounds that have been started

        return new DashboardStatsDTO
        {
            TotalTournaments = totalTournaments,
            ActiveTournaments = activeTournaments,
            TotalPlayers = totalPlayers,
            TotalCourses = totalCourses,
            CompletedTournaments = completedTournaments,
            UpcomingTournaments = upcomingTournaments,
            AveragePlayersPerTournament = Math.Round(averagePlayersPerTournament, 1),
            TotalRoundsPlayed = totalRoundsPlayed
        };
    }

    public async Task<List<DashboardActivityDTO>> GetRecentActivityAsync(int limit = 10)
    {
        var activities = new List<DashboardActivityDTO>();

        // Recent tournament creations
        var recentTournaments = await _context.Tournaments
            .OrderByDescending(t => t.Id)
            .Take(limit / 2)
            .Select(t => new DashboardActivityDTO
            {
                Id = t.Id,
                Type = "tournament_created",
                Description = $"Tournament '{t.Name}' was created",
                Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)), // Mock timestamp
                TournamentName = t.Name,
                RelatedId = t.Id
            })
            .ToListAsync();

        activities.AddRange(recentTournaments);

        // Recent player registrations
        var recentRegistrations = await _context.Players
            .OrderByDescending(p => p.Id)
            .Take(limit / 2)
            .Select(p => new DashboardActivityDTO
            {
                Id = p.Id,
                Type = "player_registered",
                Description = $"Player '{p.Name} {p.LastName}' joined",
                Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 15)), // Mock timestamp
                PlayerName = $"{p.Name} {p.LastName}",
                RelatedId = p.Id
            })
            .ToListAsync();

        activities.AddRange(recentRegistrations);

        // Recent tournament completions
        var completedTournaments = await _context.Tournaments
            .Where(t => t.Status == TournamentStatus.Completed)
            .OrderByDescending(t => t.EndDate)
            .Take(3)
            .Select(t => new DashboardActivityDTO
            {
                Id = t.Id,
                Type = "tournament_completed",
                Description = $"Tournament '{t.Name}' was completed",
                Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)), // Mock timestamp
                TournamentName = t.Name,
                RelatedId = t.Id
            })
            .ToListAsync();

        activities.AddRange(completedTournaments);

        // Sort by timestamp and return limited results
        return activities
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToList();
    }

    public async Task<List<DashboardActivityDTO>> GetTournamentActivityAsync(int tournamentId)
    {
        var activities = new List<DashboardActivityDTO>();

        // Tournament players
        var tournament = await _context.Tournaments
            .Include(t => t.Players)
            .FirstOrDefaultAsync(t => t.Id == tournamentId);

        if (tournament == null)
            return activities;

        // Player registrations for this tournament
        foreach (var player in tournament.Players.Take(5)) // Limit to recent 5
        {
            activities.Add(new DashboardActivityDTO
            {
                Id = player.Id,
                Type = "Player Registration",
                Description = $"{player.Name} {player.LastName} registered",
                Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                UserId = player.Name + player.LastName,
                TournamentName = tournament.Name,
                RelatedId = tournamentId
            });
        }

        // Tournament status changes
        activities.Add(new DashboardActivityDTO
        {
            Id = tournament.Id,
            Type = "tournament_status_changed",
            Description = $"Tournament status changed to {tournament.Status}",
            Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 5)),
            TournamentName = tournament.Name,
            RelatedId = tournamentId
        });

        return activities.OrderByDescending(a => a.Timestamp).ToList();
    }
}
