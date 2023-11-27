namespace Api.Models.DTOs.PlayerDTOs;

public class PLayerPostDTO
{
    public int MatriculaAUG { get; set; }
    public string Name { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public double HandicapIndex { get; set; }
    public DateOnly Birthdate { get; set; }
    public bool IsPreferredCategoryLadies { get; set; }
}