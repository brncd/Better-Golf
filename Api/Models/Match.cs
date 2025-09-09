using Api.Models.Enums;

namespace Api.Models
{
    public class Match
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public Tournament Tournament { get; set; } = null!;

        public int Player1Id { get; set; }
        public Player Player1 { get; set; } = null!;

        public int Player2Id { get; set; }
        public Player Player2 { get; set; } = null!;

        public MatchStatus Status { get; set; }

        // Score is holes up. Positive for Player1, negative for Player2.
        public int Score { get; set; }
        public string? Result { get; set; } // e.g., "3&2", "1 UP", "AS"

        public int? WinningPlayerId { get; set; }
        public Player? WinningPlayer { get; set; }

        public ICollection<MatchHoleResult> HoleResults { get; set; } = new List<MatchHoleResult>();
    }
}
