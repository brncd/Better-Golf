using Api.Models;
using Api.Models.DTOs.ScorecardResultDTOs;

namespace Api.Models.DTOs.ScorecardDTOs
{
    public class SingleScorecardDTO
    {
        public int Id { get; set; }
        public int PlayingHandicap { get; set; }
        public int TotalStrokes { get; set; }
        public int PlayerId { get; set; }
        public int TournamentId { get; set; }
        public List<SingleScorecardResultDTO> ScorecardResults { get; set; }

        public SingleScorecardDTO(Scorecard scorecard)
        {
            Id = scorecard.Id;
            PlayingHandicap = scorecard.PlayingHandicap;
            TotalStrokes = scorecard.TotalStrokes;
            PlayerId = scorecard.PlayerId;
            TournamentId = scorecard.TournamentId;
            ScorecardResults = scorecard.ScorecardResults.Select(sr => new SingleScorecardResultDTO(sr)).ToList();
        }
    }
}
