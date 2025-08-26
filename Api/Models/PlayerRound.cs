using System;

namespace Api.Models
{
    public class PlayerRound
    {
        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;

        public int RoundId { get; set; }
        public Round Round { get; set; } = null!;

        public TimeSpan? TeeTime { get; set; }
        public int? StartingHole { get; set; }
    }
}
