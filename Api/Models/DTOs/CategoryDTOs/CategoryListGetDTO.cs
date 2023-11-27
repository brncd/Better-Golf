namespace Api.Models.DTOs.CategoryDTOs;

public class CategoryListGetDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sex { get; set; } = "mixed";
    public int Count { get; set; }

    public CategoryListGetDTO(Category category)
    {
        Id = category.Id;
        Name = category.Name;
        Sex = category.Sex;
        Count = category.Count;
    }
}