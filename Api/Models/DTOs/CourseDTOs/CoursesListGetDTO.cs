namespace Api.Models.DTOs.CourseDTOs;

public class CoursesListGetDTO
{
    public int Id { get; set; }
    public string Name { get; set; }

    public CoursesListGetDTO(Course course)
    {
        Id = course.Id;
        Name = course.Name;
    }
}
