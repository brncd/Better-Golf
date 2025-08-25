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
            if (context.User == null || !context.User.Identity.IsAuthenticated)
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

            var scorecard = await _dbContext.Scorecards.FirstOrDefaultAsync(s => s.Id == scorecardId);

            if (scorecard == null)
            {
                // If the scorecard doesn't exist, we can't authorize based on ownership.
                // The endpoint should handle the NotFound case.
                context.Fail();
                return;
            }

            // Check if the current user is the owner of the scorecard
            if (scorecard.PlayerId.ToString() == userId)
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
