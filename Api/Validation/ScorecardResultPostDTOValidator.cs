using Api.Models.DTOs.ScorecardResultDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class ScorecardResultPostDTOValidator : AbstractValidator<ScorecardResultPostDTO>
    {
        public ScorecardResultPostDTOValidator()
        {
            RuleFor(x => x.Strokes).InclusiveBetween(1, 20);
        }
    }
}
