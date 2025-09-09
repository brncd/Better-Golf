using Api.Models.DTOs.PlayerDTOs;

namespace Api.Models.DTOs.MatchDTOs
{
    public class MatchDTO
    {
        public int Id { get; set; }
        public PlayerListGetDTO Player1 { get; set; } = null!;
        public PlayerListGetDTO Player2 { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Result { get; set; }
        public PlayerListGetDTO? Winner { get; set; }

        public MatchDTO(Match match)
        {
            Id = match.Id;
            Player1 = new PlayerListGetDTO(match.Player1);
            Player2 = new PlayerListGetDTO(match.Player2);
            Status = match.Status.ToString();
            Result = match.Result;
            if (match.WinningPlayer != null)
            {
                Winner = new PlayerListGetDTO(match.WinningPlayer);
            }
        }
    }
}
