using Api.Models.DTOs.HoleDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class HolePostDTOValidator : AbstractValidator<HolePostDTO>
    {
        public HolePostDTOValidator()
        {
            RuleFor(x => x.Par).InclusiveBetween(3, 6);
            RuleFor(x => x.Number).InclusiveBetween(1, 18);
            RuleFor(x => x.StrokeIndex).InclusiveBetween(1, 18);
        }
    }
}
