namespace Api.Models.DTOs.CategoryDTOs;

public class SingleCategoryDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sex { get; set; } = "mixed";
    public int MinAge { get; set; }
    public int MaxAge { get; set; }
    public double MinHcap { get; set; }
    public double MaxHcap { get; set; }
    public int NumberOfHoles { get; set; }
    public SingleCategoryDTO(Category category)
    {
        Id = category.Id;
        Name = category.Name;
        Sex = category.Sex;
        MinAge = category.MinAge;
        MaxAge = category.MaxAge;
        MinHcap = category.MinHcap;
        MaxHcap = category.MaxHcap;
        NumberOfHoles = category.NumberOfHoles;
    }
}