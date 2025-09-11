namespace Api.Models.DTOs.CategoryDTOs;

public class CategoryPostDTO
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double? HandicapMin { get; set; }
    public double? HandicapMax { get; set; }
    public string Gender { get; set; } = "mixed";
    public int? AgeMin { get; set; }
    public int? AgeMax { get; set; }
}
