using System.ComponentModel.DataAnnotations;

namespace Api.Models
{
    public class TournamentRanking
    {
        [Key]
        public int Position { get; set; }
        public int TournamentId { get; set; }
        public int PlayerId { get; set; }
        public int TotalStrokes { get; set; }
    }
}