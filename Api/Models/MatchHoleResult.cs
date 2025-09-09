namespace Api.Models
{
    public class MatchHoleResult
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public Match Match { get; set; } = null!;

        public int HoleId { get; set; }
        public Hole Hole { get; set; } = null!;

        // WinningPlayerId is null if the hole was halved (tied)
        public int? WinningPlayerId { get; set; }
        public Player? WinningPlayer { get; set; }
    }
}
