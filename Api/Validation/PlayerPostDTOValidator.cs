using Api.Models.DTOs.PlayerDTOs;
using FluentValidation;
using System;

namespace Api.Validation
{
    public class PlayerPostDTOValidator : AbstractValidator<PlayerPostDTO>
    {
        public PlayerPostDTOValidator()
        {
            RuleFor(x => x.MembershipNumber).NotEmpty().WithMessage("Membership number is required");
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Handicap).InclusiveBetween(-10, 54);
            RuleFor(x => x.DateOfBirth).Must(BeValidDate).WithMessage("Date of birth must be a valid date in the past");
            RuleFor(x => x.Gender).NotEmpty().Must(BeValidGender).WithMessage("Gender must be 'male' or 'female'");
        }

        private bool BeValidDate(string dateString)
        {
            if (DateTime.TryParse(dateString, out DateTime date))
            {
                return date < DateTime.Now;
            }
            return false;
        }

        private bool BeValidGender(string gender)
        {
            return gender?.ToLower() == "male" || gender?.ToLower() == "female";
        }
    }
}
