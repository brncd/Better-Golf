using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Models.Authorization
{
    public class ScorecardOwnerAuthorizationHandler : AuthorizationHandler<IsOwnerRequirement, int>
    {
        private readonly BgContext _dbContext;

        public ScorecardOwnerAuthorizationHandler(BgContext dbContext)
        {
            _dbContext = dbContext;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsOwnerRequirement requirement, int scorecardId)
        {
            if (context.User == null || context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                context.Fail();
                return;
            }

            // If the user is an Admin, they can perform any operation
            if (context.User.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return;
            }

            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                context.Fail();
                return;
            }

            var scorecard = await _dbContext.Scorecards
                .Include(s => s.Player) // Include the Player navigation property
                .FirstOrDefaultAsync(s => s.Id == scorecardId);

            if (scorecard == null)
            {
                context.Fail();
                return;
            }

            // Check if the current user is the owner of the scorecard
            if (scorecard.Player?.ApplicationUserId == userId)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
    }
}
