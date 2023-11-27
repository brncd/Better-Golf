namespace Api.Models.DTOs.CourseDTOs;

public class CoursePostDTO
{
    public string Name { get; set; } = null!;
    public int CourseSlope { get; set; }
    public double CourseRating { get; set; }
    public int Par { get; set; }
}