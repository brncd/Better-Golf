namespace Api.Models.DTOs.CourseDTOs;

public class SingleCourseDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int CourseSlope { get; set; }
    public double CourseRating { get; set; }    
    public int Par { get; set; }
    public SingleCourseDTO(Course course)
    {
        Id = course.Id;
        Name = course.Name;
        CourseSlope = course.CourseSlope;
        CourseRating = course.CourseRating;
        Par = course.Par;
    }
}
