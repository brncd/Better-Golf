using Api.Data;
using Api.Models.DTOs.CategoryDTOs;
using Api.Models.DTOs.PlayerDTOs;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Collections;

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

    public static async Task<IResult> GetAllCategories(BgContext db)
    {
        return Results.Ok(await db.Categories.Select(x => new CategoryListGetDTO(x)).ToArrayAsync());
    }
    public static async Task<IResult> GetCategory(int id, BgContext db)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) { return Results.NotFound(); }

        return Results.Ok(new SingleCategoryDTO(category));
    }
    public static async Task<IResult> CreateCategory(BgContext db, CategoryPostDTO categorydto)
    {
        var category = new Category(categorydto);
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return Results.Created($"/Categories/{category.Id}", new SingleCategoryDTO(category));
    }
    public static async Task<IResult> UpdateCategory(int id, BgContext db, CategoryPostDTO InputCategory)
    {
        var category = await db.Categories.FindAsync(id);

        if (category == null) { return Results.NotFound(); }

        category.Name = InputCategory.Name;
        category.MinAge = InputCategory.MinAge;
        category.MaxAge = InputCategory.MaxAge;
        category.MinHcap = InputCategory.MinHcap;
        category.MaxHcap = InputCategory.MaxHcap;
        category.NumberOfHoles = InputCategory.NumberOfHoles;

        await db.SaveChangesAsync();

        return Results.NoContent();
    }
    public static async Task<IResult> DeleteCategory(int id, BgContext db)
    {
        var category = await db.Categories.FindAsync(id);

        if (category == null) { return Results.NotFound(); }

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    ///Function that return the players of a category
    public static async Task<IResult> GetCategoryPlayers(int Id, BgContext db)
    {
        var category = await db.Categories.Include(cat => cat.Players).FirstOrDefaultAsync(cat => cat.Id == Id);
        if (category == null) { return Results.NotFound(); }

        var dtosList = new List<PlayerListGetDTO>();
        if (category.Players == null) { return Results.Empty; };

        foreach (var p in category.Players)
        {
            dtosList.Add(new PlayerListGetDTO(p));
        }
        return Results.Ok(dtosList);
    }
    public static async Task<IResult> AddCategoryPlayer(int Id, int playerid, BgContext db)
    {
        var category = await db.Categories.FindAsync(Id);
        if (category == null) { return Results.NotFound(); };

        var player = await db.Players.FindAsync(playerid);
        if (player == null) { return Results.NotFound(); };

        if (category.Players != null && !category.Players.Any(p => p.Id == playerid))
        {
            category.Players.Add(player);
            category.Count = category.Players.Count;
            Course defaultCourse = Course.GetDefaultCourse(db);
            //player.AssignScorecard(category, defaultCourse, db);
            await db.SaveChangesAsync();
            return Results.Ok(new PlayerListGetDTO(player));
        }
        return Results.Text("Player already in tournament");
    }
    // Function that delete player of a cetegory
    public static async Task<IResult> DeleteCategoryPlayer(int Id, int playerid, BgContext db)
    {
        var category = await db.Categories.Include(x => x.Players).FirstOrDefaultAsync(x => x.Id == Id);
        if (category == null) { return Results.NotFound(); }

        if (category.Players == null) { return Results.NotFound(); };

        var playerInCategory = category.Players.FirstOrDefault(p => p.Id == playerid);
        if (playerInCategory != null)
        {
            category.Players.Remove(playerInCategory);
            category.Count = category.Players.Count;
            await db.SaveChangesAsync();
            return Results.Ok("Jugador eliminado de la categoria");
        }
        return Results.Text("El jugador no se encontro en la categoria");
    }
    public static async Task<IResult> SetOpenCourse(int Id, int CourseId, BgContext db)
    {
        var category = await db.Categories.FindAsync(Id);
        if (category == null) { return Results.NotFound(); };

        var course = await db.Courses.FindAsync(CourseId);
        if (course == null) { return Results.NotFound(); }

        category.OpenCourse = course;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    public static async Task<IResult> SetLadiesCourse(int Id, int CourseId, BgContext db)
    {
        var category = await db.Categories.FindAsync(Id);
        if (category == null) { return Results.NotFound(); };

        var course = await db.Courses.FindAsync(CourseId);
        if (course == null) { return Results.NotFound(); }

        category.LadiesCourse = course;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static Category GetDefaultCategory(Tournament tournament, BgContext db)
    {
        Course defaultCourse = Course.GetDefaultCourse(db);
        return
            new Category()
            {
                Name = "Mixed General Category Hcap cutoff @56",
                Sex = "mixed",
                OpenCourse = defaultCourse,
                LadiesCourse = null,
                Tournament = tournament,
                MinAge = 0,
                MaxAge = 130,
                MinHcap = -15,
                MaxHcap = 56,
            };
    }
}
