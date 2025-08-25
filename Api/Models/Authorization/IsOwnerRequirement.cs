using Microsoft.AspNetCore.Authorization;

namespace Api.Models.Authorization
{
    public class IsOwnerRequirement : IAuthorizationRequirement
    {
        public IsOwnerRequirement()
        {
        }
    }
}
