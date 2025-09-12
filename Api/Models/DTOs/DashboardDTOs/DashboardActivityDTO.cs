namespace Api.Models.DTOs.DashboardDTOs;

public class DashboardActivityDTO
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "tournament_created", "player_registered", "round_completed", etc.
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? PlayerName { get; set; }
    public string? TournamentName { get; set; }
    public string? UserId { get; set; }
    public int? RelatedId { get; set; } // Tournament ID, Player ID, etc.
}
