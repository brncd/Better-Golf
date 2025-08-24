using Api.Models.DTOs.CategoryDTOs;

namespace Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sex { get; set; } = "mixed";
    public Course? OpenCourse { get; set; }
    public Course? LadiesCourse { get; set; }
    public int MinAge { get; set; }
    public int MaxAge { get; set; }
    public double MinHcap { get; set; }
    public double MaxHcap { get; set; }
    public int NumberOfHoles { get; set; }
    public int Count { get; set; }
    public Tournament? Tournament { get; set; } = null!;
    public Category? ParentCategory { get; set; }
    public List<Category>? ChildrenCategories { get; set; }
    public List<Player>? Players { get; set; } = new List<Player>();

    public Category(string name, Course openCourse, Course ladiesCourse, List<Player> players, int numberOfHoles)
    {
        Name = name;
        OpenCourse = openCourse;
        LadiesCourse = ladiesCourse;
        Players = players;
        NumberOfHoles = numberOfHoles;
    }
    public Category(CategoryPostDTO categoryPostDTO)
    {
        Name = categoryPostDTO.Name;
        Sex = categoryPostDTO.Sex;
        MinAge = categoryPostDTO.MinAge;
        MaxAge = categoryPostDTO.MaxAge;
        MinHcap = categoryPostDTO.MinHcap;
        MaxHcap = categoryPostDTO.MaxHcap;
        NumberOfHoles = categoryPostDTO.NumberOfHoles;
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
