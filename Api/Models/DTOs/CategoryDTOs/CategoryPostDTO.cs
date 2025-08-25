using Api.Models.Enums;

namespace Api.Models.DTOs.CategoryDTOs;

public class CategoryPostDTO
{
    public string Name { get; set; } = null!;
    public Gender Sex { get; set; }
    public int MinAge { get; set; }
    public int MaxAge { get; set; }
    public double MinHcap { get; set; }
    public double MaxHcap { get; set; }
    public int NumberOfHoles { get; set; }
}
