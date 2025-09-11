using Api.Models.DTOs.CategoryDTOs;
using Api.Models.Enums;

namespace Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public Gender Sex { get; set; }
    public Course? OpenCourse { get; set; }
    public Course? LadiesCourse { get; set; }
    public int? AgeMin { get; set; }
    public int? AgeMax { get; set; }
    public double? HandicapMin { get; set; }
    public double? HandicapMax { get; set; }
    public int NumberOfHoles { get; set; }
    public int Count { get; set; }
    public Tournament? Tournament { get; set; } = null!;
    public int TournamentId { get; set; }
    public Category? ParentCategory { get; set; }
    public List<Category>? ChildrenCategories { get; set; }
    public List<Player>? Players { get; set; } = new List<Player>();

    // Legacy properties for backward compatibility
    public int MinAge 
    { 
        get => AgeMin ?? 0; 
        set => AgeMin = value; 
    }
    public int MaxAge 
    { 
        get => AgeMax ?? 100; 
        set => AgeMax = value; 
    }
    public double MinHcap 
    { 
        get => HandicapMin ?? 0.0; 
        set => HandicapMin = value; 
    }
    public double MaxHcap 
    { 
        get => HandicapMax ?? 54.0; 
        set => HandicapMax = value; 
    }

    
    public Category(CategoryPostDTO categoryPostDTO)
    {
        Name = categoryPostDTO.Name;
        Description = categoryPostDTO.Description;
        AgeMin = categoryPostDTO.AgeMin;
        AgeMax = categoryPostDTO.AgeMax;
        HandicapMin = categoryPostDTO.HandicapMin;
        HandicapMax = categoryPostDTO.HandicapMax;
        Sex = Enum.Parse<Gender>(categoryPostDTO.Gender, true);
    }
    public Category()
    {
    }

    public override bool Equals(object? obj)
    {
        if (obj is Category category)
        {
            return Id == category.Id;
        }
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $" Id: {Id}, Name: {Name}, Number of players: {Count}";
    }
}