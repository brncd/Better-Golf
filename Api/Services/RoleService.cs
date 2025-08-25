using Microsoft.AspNetCore.Identity;
using Api.Models.Results;

namespace Api.Services
{
    public class RoleService
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<IdentityUser> _userManager;

        public RoleService(RoleManager<IdentityRole> roleManager, UserManager<IdentityUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task<Result<bool>> CreateRoleAsync(string roleName)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
            {
                return Result<bool>.Failure(new Error("RoleAlreadyExists", $"Role {roleName} already exists."));
            }

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
            if (result.Succeeded)
            {
                return Result<bool>.Success(true);
            }
            return Result<bool>.Failure(new Error("RoleCreationError", $"Error creating role {roleName}: {string.Join(", ", result.Errors.Select(e => e.Description))}"));
        }

        public async Task<Result<bool>> AssignUserToRoleAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Result<bool>.Failure(new Error("UserNotFound", "User not found."));
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                return Result<bool>.Failure(new Error("RoleNotFound", $"Role {roleName} not found."));
            }

            if (await _userManager.IsInRoleAsync(user, roleName))
            {
                return Result<bool>.Failure(new Error("UserAlreadyInRole", $"User {user.UserName} is already in role {roleName}."));
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                return Result<bool>.Success(true);
            }
            return Result<bool>.Failure(new Error("RoleAssignmentError", $"Error assigning user {user.UserName} to role {roleName}: {string.Join(", ", result.Errors.Select(e => e.Description))}"));
        }

        public async Task<Result<bool>> RemoveUserFromRoleAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Result<bool>.Failure(new Error("UserNotFound", "User not found."));
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                return Result<bool>.Failure(new Error("RoleNotFound", $"Role {roleName} not found."));
            }

            if (!await _userManager.IsInRoleAsync(user, roleName))
            {
                return Result<bool>.Failure(new Error("UserNotInRole", $"User {user.UserName} is not in role {roleName}."));
            }

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                return Result<bool>.Success(true);
            }
            return Result<bool>.Failure(new Error("RoleRemovalError", $"Error removing user {user.UserName} from role {roleName}: {string.Join(", ", result.Errors.Select(e => e.Description))}"));
        }

        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<string>(); // Or throw an exception, depending on desired error handling
            }
            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }
    }
}
