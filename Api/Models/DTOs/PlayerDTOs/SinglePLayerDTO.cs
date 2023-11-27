namespace Api.Models.DTOs.PlayerDTOs;

public class SinglePLayerDTO 
{
    public int Id { get; set; }
    public int MatriculaAUG { get; set; }
    public string Name { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public double HandicapIndex { get; set; }
    public DateOnly Birthdate { get; set; }
    public bool IsPreferredCategoryLadies { get; set; }

    public SinglePLayerDTO(Player player)
    {
        Id = player.Id;
        MatriculaAUG = player.MatriculaAUG;
        Name = player.Name;
        LastName = player.LastName;
        HandicapIndex = player.HandicapIndex;
        Birthdate = player.Birthdate;
        IsPreferredCategoryLadies = player.IsPreferredCategoryLadies;
    }
}