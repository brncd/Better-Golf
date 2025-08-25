using Api.Models.DTOs.CategoryDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class CategoryPostDTOValidator : AbstractValidator<CategoryPostDTO>
    {
        public CategoryPostDTOValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Sex).IsInEnum();
            RuleFor(x => x.MaxAge).GreaterThan(x => x.MinAge).WithMessage("Max age must be greater than min age.");
            RuleFor(x => x.MinAge).InclusiveBetween(0, 130);
            RuleFor(x => x.MaxAge).InclusiveBetween(0, 130);
            RuleFor(x => x.MaxHcap).GreaterThan(x => x.MinHcap).WithMessage("Max handicap must be greater than min handicap.");
            RuleFor(x => x.NumberOfHoles).InclusiveBetween(9, 18);
        }
    }
}