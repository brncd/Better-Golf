using Api.Models.DTOs.HoleDTOs;

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
}
