using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.ResultDTOs
{
    public class TournamentRankingDTO
    {
        [Key]
        public int Position { get; set; }
        public int TournamentId { get; set; }
        public int PlayerId { get; set; }
        public int TotalStrokes { get; set; }
    }
}