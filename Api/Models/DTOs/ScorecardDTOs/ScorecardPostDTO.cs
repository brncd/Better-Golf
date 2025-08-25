using Api.Models.DTOs.ScorecardResultDTOs;

namespace Api.Models.DTOs.ScorecardDTOs
{
    public class ScorecardPostDTO
    {
        public int PlayingHandicap { get; set; }
        public int PlayerId { get; set; }
        public int TournamentId { get; set; }
        public List<ScorecardResultPostDTO> ScorecardResults { get; set; }
    }
}
