namespace Api.Models.DTOs.PlayerDTOs;

public class PlayerListGetDTO
{
    public int Id { get; set; }
    public int MatriculaAUG { get; set; }
    public string Name { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string HandicapIndex { get; set; } = "n/d";
    public PlayerListGetDTO(Player player)
    {
        Id = player.Id;
        MatriculaAUG = player.MatriculaAUG;
        Name = player.Name;
        LastName = player.LastName;
        HandicapIndex = player.HandicapIndex.ToString();
    }
}
