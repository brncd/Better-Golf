using System.ComponentModel.DataAnnotations;
using Api.Models;

namespace Api.Models.DTOs.ResultDTOs
{
    public class TournamentRankingDTO
    {
        [Key]
        public int Position { get; set; }
        public int TournamentId { get; set; }
        public int PlayerId { get; set; }
        public int TotalStrokes { get; set; }

        public TournamentRankingDTO() { }

        public TournamentRankingDTO(TournamentRanking ranking)
        {
            Position = ranking.Position;
            TournamentId = ranking.TournamentId;
            PlayerId = ranking.PlayerId;
            TotalStrokes = ranking.TotalStrokes;
        }
    }
}
