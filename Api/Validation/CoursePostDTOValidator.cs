using Api.Models.DTOs.CourseDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class CoursePostDTOValidator : AbstractValidator<CoursePostDTO>
    {
        public CoursePostDTOValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.CourseSlope).InclusiveBetween(55, 155);
            RuleFor(x => x.CourseRating).InclusiveBetween(60, 80);
            RuleFor(x => x.Par).InclusiveBetween(60, 80);
        }
    }
}
