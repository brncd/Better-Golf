
using Api.Models.DTOs.PlayerDTOs;

namespace Api.Models.DTOs.RoundDTOs
{
    public class TeeTimeDTO
    {
        public int RoundNumber { get; set; }
        public DateOnly Date { get; set; }
        public PlayerListGetDTO Player { get; set; } = null!;
        public TimeSpan? TeeTime { get; set; }
        public int? StartingHole { get; set; }

        public TeeTimeDTO(PlayerRound playerRound)
        {
            RoundNumber = playerRound.Round.RoundNumber;
            Date = playerRound.Round.Date;
            Player = new PlayerListGetDTO(playerRound.Player);
            TeeTime = playerRound.TeeTime;
            StartingHole = playerRound.StartingHole;
        }
    }
}
