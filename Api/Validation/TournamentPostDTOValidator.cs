using Api.Models.DTOs.TournamentDTOs;
using FluentValidation;

namespace Api.Validation
{
    public class TournamentPostDTOValidator : AbstractValidator<TournamentPostDTO>
    {
        public TournamentPostDTOValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tournament name is required.")
                .MaximumLength(100).WithMessage("Tournament name cannot be longer than 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.");

            RuleFor(x => x.TournamentType)
                .NotEmpty().WithMessage("Tournament type is required.");

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate).WithMessage("End date must be after the start date.");
            
            RuleFor(x => x.RoundInfo)
                .NotNull().WithMessage("Round information is required.");
        }
    }
}
