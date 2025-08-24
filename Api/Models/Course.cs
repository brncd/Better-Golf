using Api.Models.DTOs.CourseDTOs;

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
}
