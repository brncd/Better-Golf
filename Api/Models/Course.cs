using Api.Data;
using Api.Models.DTOs.CourseDTOs;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Models;

public class Course
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int CourseSlope { get; set; }
    public double CourseRating { get; set; }
    public int Par { get; set; }
    public List<Hole> Holes { get; set; } = new List<Hole>();

    public Course(string name, int courseSlope, double courseRating,
                   List<Hole> holes)
    {
        Name = name;
        CourseSlope = courseSlope;
        CourseRating = courseRating;
        Holes = holes;
    }
    public Course(CoursePostDTO coursePostDTO)
    {
        Name = coursePostDTO.Name;
        CourseSlope = coursePostDTO.CourseSlope;
        CourseRating = coursePostDTO.CourseRating;
        Par = coursePostDTO.Par;
    }
    public Course() 
    {
    }
    public override bool Equals(object? obj)
    {
        if (obj is Course course)
            return course.Id == Id;
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $"Id: {Id}, Name: {Name}, Par: {Par}";
    }
    public static async Task<IResult> GetAllCourses(BgContext db)
    {
        return Results.Ok(await db.Courses.Select(x => new CoursesListGetDTO(x)).ToArrayAsync());
    }
    public static async Task<IResult> GetCourse(int id, BgContext db)
    {
        var course = await db.Courses.FindAsync(id);

        if (course == null) { return Results.NotFound(); }

        return Results.Ok(new SingleCourseDTO(course));
    }
    public static async Task<IResult> CreateCourse(BgContext db, CoursePostDTO coursePost)
    {
        var course = new Course(coursePost);
        db.Courses.Add(course);
        await db.SaveChangesAsync();

        return Results.Created($"/Courses/{course.Id}", new SingleCourseDTO(course));
    }
    public static async Task<IResult> UpdateCourse(int id, BgContext db, CoursePostDTO InputCourse)
    {
        var course = await db.Courses.FindAsync(id);

        if (course == null) { return Results.NotFound(); }

        course.Par = InputCourse.Par;
        course.Name = InputCourse.Name;
        course.CourseRating = InputCourse.CourseRating;
        course.CourseSlope = InputCourse.CourseSlope;

        await db.SaveChangesAsync();

        return Results.NoContent();
    }
    public static async Task<IResult> DeleteCourse(int id, BgContext db)
    {
        var course = await db.Courses.FindAsync(id);

        if (course == null) { return Results.NotFound(); }

        db.Courses.Remove(course);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    ///function that return the holes of a course
    public static async Task<IResult> GetCourseHoles(int Id, BgContext db)
    {
        var course = await db.Courses.Include(c => c.Holes).FirstOrDefaultAsync(c => c.Id == Id);
        if (course == null) { return Results.NotFound(); };

        var dtosList = new List<HoleListGetDTO>();
        foreach(var h in course.Holes)
        {
            dtosList.Add(new HoleListGetDTO(h));
        }
        return Results.Ok(dtosList);
    }
    public static async Task<IResult> AddCourseHole(int Id, HolePostDTO holedto, BgContext db)
    {
        var course = await db.Courses.FindAsync(Id);
        if (course == null) { return Results.NotFound(); };

        course.Holes.Add(new Hole(holedto));
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    internal int CalculatePar()
    {
        if (Holes == null)
     	    return 0;
        int totalPar = 0;
        foreach (Hole hole in Holes)
        {
	    totalPar += hole.Par;
        }
        return totalPar;
    }
    public static async Task<IResult> DeleteCourseHole(int Id, int holeId, BgContext db)
    {
        var course = await db.Courses.Include(c => c.Holes).FirstOrDefaultAsync(item => item.Id == Id);
        if (course == null) { return Results.NotFound(); };

        var hole = await db.Holes.FindAsync(holeId);
        if (hole == null) { return Results.NotFound(); };

        course.Holes.Remove(hole);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    public static Course GetDefaultCourse(BgContext db)
    {
      
        var existingCourse = db.Courses.Include(c => c.Holes).FirstOrDefault(c => c.Name == "Default Course");
        if (existingCourse != null)
        {
            return existingCourse;
        }

        var defaultCourse = new Course
        {
            Name = "Default Course",
            CourseSlope = 113,
            CourseRating = 72.0,
            Par = 72,
            Holes = GenerateDefaultHoles(18)
        };

        db.Courses.Add(defaultCourse);
        db.SaveChanges();

        return defaultCourse;
    }
    private static List<Hole> GenerateDefaultHoles(int numberOfHoles)
    {
        List<Hole> holes = new List<Hole>();
        for (int i = 1; i <= numberOfHoles; i++)
        {
            holes.Add(new Hole
            {
                Par = 4,
                Number = i
            });
        }
        return holes;
    }
}
