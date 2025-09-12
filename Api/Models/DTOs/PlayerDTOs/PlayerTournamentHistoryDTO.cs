namespace Api.Models.DTOs.PlayerDTOs;

public class PlayerTournamentHistoryDTO
{
    public int TournamentId { get; set; }
    public string TournamentName { get; set; } = string.Empty;
    public string TournamentType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? Position { get; set; }
    public int? TotalScore { get; set; }
    public int? StablefordPoints { get; set; }
    public int RoundsPlayed { get; set; }
    public int TotalRounds { get; set; }
    public DateTime RegistrationDate { get; set; }
}

public class PlayerTournamentHistoryListDTO
{
    public int PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public List<PlayerTournamentHistoryDTO> Tournaments { get; set; } = new();
    public int TotalTournaments { get; set; }
    public int CompletedTournaments { get; set; }
    public int WonTournaments { get; set; }
    public int Top3Finishes { get; set; }
    public double AverageScore { get; set; }
}
