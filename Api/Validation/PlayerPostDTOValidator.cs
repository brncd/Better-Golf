using Api.Models.DTOs.PlayerDTOs;
using FluentValidation;
using System;

namespace Api.Validation
{
    public class PlayerPostDTOValidator : AbstractValidator<PLayerPostDTO>
    {
        public PlayerPostDTOValidator()
        {
            RuleFor(x => x.MatriculaAUG).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.HandicapIndex).InclusiveBetween(-10, 54);
            RuleFor(x => x.Birthdate).LessThan(DateOnly.FromDateTime(DateTime.Now)).WithMessage("Birthdate must be in the past.");
        }
    }
}
