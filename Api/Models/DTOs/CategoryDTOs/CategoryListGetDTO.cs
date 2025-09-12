namespace Api.Models.DTOs.CategoryDTOs;

public class CategoryListGetDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double? HandicapMin { get; set; }
    public double? HandicapMax { get; set; }
    public string Gender { get; set; } = "mixed";
    public int? AgeMin { get; set; }
    public int? AgeMax { get; set; }

    public CategoryListGetDTO(Category category)
    {
        Id = category.Id;
        Name = category.Name;
        Description = category.Description ?? "";
        HandicapMin = category.HandicapMin;
        HandicapMax = category.HandicapMax;
        Gender = category.Sex.ToString().ToLower();
        AgeMin = category.AgeMin;
        AgeMax = category.AgeMax;
    }
}
