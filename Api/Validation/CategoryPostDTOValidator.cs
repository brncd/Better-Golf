using Api.Models.DTOs.CategoryDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class CategoryPostDTOValidator : AbstractValidator<CategoryPostDTO>
    {
        public CategoryPostDTOValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).MaximumLength(500);
            RuleFor(x => x.Gender).NotEmpty().Must(BeValidGender).WithMessage("Gender must be 'male', 'female', or 'mixed'");
            
            When(x => x.AgeMax.HasValue && x.AgeMin.HasValue, () => {
                RuleFor(x => x.AgeMax).GreaterThan(x => x.AgeMin).WithMessage("Max age must be greater than min age.");
            });
            
            When(x => x.AgeMin.HasValue, () => {
                RuleFor(x => x.AgeMin).InclusiveBetween(0, 130);
            });
            
            When(x => x.AgeMax.HasValue, () => {
                RuleFor(x => x.AgeMax).InclusiveBetween(0, 130);
            });
            
            When(x => x.HandicapMax.HasValue && x.HandicapMin.HasValue, () => {
                RuleFor(x => x.HandicapMax).GreaterThan(x => x.HandicapMin).WithMessage("Max handicap must be greater than min handicap.");
            });
        }

        private bool BeValidGender(string gender)
        {
            var validGenders = new[] { "male", "female", "mixed" };
            return validGenders.Contains(gender?.ToLower());
        }
    }
}