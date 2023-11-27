using Api.Data;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Models;

public class Hole
{
    public int Id { get; set; }
    public int Par { get; set; }
    public int Number { get; set; }
    public int StrokeIndex { get; set; }
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public Hole(int par, int number, int strokeindex)
    {
        Par = par;
        Number = number;
        StrokeIndex = strokeindex;
    }
    public Hole(int par, int number, int strokeindex, List<Course> courses)
    {
        Par = par;
        Number = number;
        StrokeIndex = strokeindex;
        Courses = courses;
    }
    public Hole(HolePostDTO holedto)
    {
        Par = holedto.Par;
        Number = holedto.Number;
        StrokeIndex = holedto.StrokeIndex;
    }
    public Hole() {}
    public override bool Equals(object? obj)
    {
        if (obj is Hole hole)
        {
            return this.Id == hole.Id;
        }
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $"Id: {Id} Number: {Number}, Storke Index: {StrokeIndex}. Par: {Par}";
    }
    public static async Task<IResult> GetAllHoles(BgContext db)
    {
        return Results.Ok(await db.Holes.Select(hole => new HoleListGetDTO(hole)).ToArrayAsync());
    }
    public static async Task<IResult> GetHole(int id, BgContext db)
    {
        var hole = await db.Holes.FindAsync(id);

        if (hole == null) { return Results.NotFound(); }

        return Results.Ok(new SingleHoleDTO(hole));
    }
    public static async Task<IResult> CreateHole(BgContext db, HolePostDTO holedto)
    {
        Hole hole = new(holedto);
        db.Holes.Add(hole);
        await db.SaveChangesAsync();

        return Results.Created($"/Holes/{hole.Id}", new SingleHoleDTO(hole));
    }
    public static async Task<IResult> UpdateHole(int id, BgContext db, HolePostDTO InputHole)
    {
        var hole = await db.Holes.FindAsync(id);

        if (hole == null) { return Results.NotFound(); }

        hole.Par = InputHole.Par;
        hole.Number = InputHole.Number;
        hole.StrokeIndex = InputHole.StrokeIndex;

        await db.SaveChangesAsync();

        return Results.NoContent();
    }
    public static async Task<IResult> DeleteHole(int id, BgContext db)
    {
        var hole = await db.Holes.FindAsync(id);

        if (hole == null) { return Results.NotFound(); }

        db.Holes.Remove(hole);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
