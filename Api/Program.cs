using System.Security.Claims; // Added
using Api.Data;
using Api.Models;
using Api;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Api.Models.DTOs.CategoryDTOs;
using Api.Services;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs;
using Api.Models.DTOs.CourseDTOs;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Added
using Microsoft.IdentityModel.Tokens; // Added
using System.Text; // Added
using Microsoft.AspNetCore.Authorization; // Added
using Microsoft.AspNetCore.Identity; // Added
using Api.Models.DTOs.ScorecardResultDTOs; // Added
using Microsoft.AspNetCore.Mvc; // Added for [FromServices]
using FluentValidation.AspNetCore;
using FluentValidation;
using Api.Validation;
using Api.Models.Results;
using Api.Models.DTOs.MatchDTOs;
using Api.Models.DTOs.RoleDTOs;
using Api.Models.DTOs.RoundDTOs;
using Api.Models.DTOs.ScorecardDTOs;
using Api.Models.DTOs.AuthDTOs;
using Api.Models.DTOs.DashboardDTOs;
using Api.Models.Common;
using Api.Models.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Api.Models.Enums; // Added for TournamentStatus
using Api.Middleware;
using Microsoft.AspNetCore.Http.Json;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddDbContext<BgContext>(options => 
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
        
        builder.Services.AddIdentityApiEndpoints<IdentityUser>() // Added
            .AddRoles<IdentityRole>() // Added
            .AddEntityFrameworkStores<BgContext>(); // Added

        // Configure Identity options for demo user
        builder.Services.Configure<IdentityOptions>(options =>
        {
            // Password settings for development
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequiredLength = 4;
            options.Password.RequiredUniqueChars = 1;
        });

        // Add FluentValidation
        builder.Services.AddFluentValidationAutoValidation();
        builder.Services.AddValidatorsFromAssemblyContaining<TournamentPostDTOValidator>();

        // Add Authentication services
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false, // For development, set to true in production
                ValidateAudience = false, // For development, set to true in production
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
            };
        });

        builder.Services.AddAuthorization();
        
        // Configure JSON serialization for DateOnly
        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        });
        
        builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
        {
            options.SerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        });
        
        // Register services
        builder.Services.AddScoped<PlayerService>();
        builder.Services.AddScoped<CourseService>();
        builder.Services.AddScoped<TournamentService>();
        builder.Services.AddScoped<CategoryService>();
        builder.Services.AddScoped<RoleService>();
        builder.Services.AddScoped<TournamentRankingService>();
        builder.Services.AddScoped<DemoDataService>(); 
        builder.Services.AddScoped<AuthService>(); 
        builder.Services.AddScoped<ScorecardResultService>();
        builder.Services.AddScoped<ResultService>();
        builder.Services.AddScoped<RoundInfoService>();
        builder.Services.AddScoped<RoundService>();
        builder.Services.AddScoped<MatchService>();
        builder.Services.AddScoped<ScorecardService>(); // No change needed here, dependencies are resolved automatically
        builder.Services.AddScoped<DashboardService>();

        builder.Services.AddScoped<IAuthorizationHandler, ScorecardOwnerAuthorizationHandler>(); // Register the custom authorization handler

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
            options.AddPolicy("TournamentOrganizerPolicy", policy => policy.RequireRole("Admin", "TournamentOrganizer"));
            options.AddPolicy("PlayerPolicy", policy => policy.RequireRole("Admin", "TournamentOrganizer", "Player"));
            options.AddPolicy("ManageOwnScorecard", policy => policy.Requirements.Add(new IsOwnerRequirement()));
            // More granular policies for resource-based authorization will be added later
        });

        
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v0.1", new OpenApiInfo { Title = "Better Golf", Description = "API", Version = "0.1" });
        });
        builder.Services.AddCors(options =>
        {
            options.AddPolicy(name: "TodoPasa",
              builder =>
              {
                  builder.WithOrigins("http://localhost:3001") // Fixed: Changed from 3000 to 3001
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
              });
        });
        
        var app = builder.Build();

        app.UseMiddleware<ExceptionMiddleware>();

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v0.1/swagger.json", "Beter Golf API beta");
        });

        app.UseCors("TodoPasa");

        app.UseAuthentication(); // Added
        app.UseAuthorization();  // Added
        
        // Map controllers
        
        // Custom Auth endpoints
        app.MapPost("/api/auth/login", async ([FromServices] AuthService authService, LoginRequestDTO request) =>
        {
            var result = await authService.LoginAsync(request);
            if (result == null)
                return Results.Unauthorized();
            
            return Results.Ok(result);
        });

        app.MapPost("/api/auth/register", async ([FromServices] AuthService authService, RegisterRequestDTO request) =>
        {
            var result = await authService.RegisterAsync(request);
            if (result == null)
                return Results.BadRequest("Registration failed");
            
            return Results.Ok(result);
        });

        app.MapGet("/", () =>
        {
            string filePath = "./index.html";
    
            if (File.Exists(filePath))
            {
                string htmlContent = File.ReadAllText(filePath);
                return Results.Content(htmlContent, "text/html");
            }
            else
            {
                return Results.NotFound("HTML file not found");
            }
        });

        // Seccion Players
        app.MapGet("/api/Players", async (PlayerService playerService, [AsParameters] PaginationRequest pagination) =>
        {
            var result = await playerService.GetAllPlayersAsync(pagination);
            return Results.Ok(result);
        }).RequireAuthorization("PlayerPolicy");

        app.MapGet("/api/Players/{id:int}", async (int id, PlayerService playerService) =>
        {
            var player = await playerService.GetPlayerByIdAsync(id);
            return player == null ? Results.NotFound() : Results.Ok(player);
        }).RequireAuthorization("PlayerPolicy");

        app.MapPost("/api/Players", async (PlayerPostDTO playerDto, PlayerService playerService) =>
        {
            var result = await playerService.CreatePlayerAsync(playerDto);
            return result.IsSuccess ? Results.Created($"/api/Players/{result.Value!.Id}", result.Value) : Results.BadRequest(result.Error);
        }).RequireAuthorization("AdminPolicy");

        app.MapPut("/api/Players/{id:int}", async (int id, PlayerPostDTO playerDto, PlayerService playerService) =>
        {
            var result = await playerService.UpdatePlayerAsync(id, playerDto);
            return result.IsSuccess ? Results.Ok() : Results.BadRequest(result.Error);
        }).RequireAuthorization("AdminPolicy");

        app.MapDelete("/api/Players/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] PlayerService service, int id) => {
            var result = await service.DeletePlayerAsync(id);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Player not found"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Bad request")
                };
            }
            return Results.NoContent();
        });
        app.MapGet("/api/Players/{id}/Tournaments", async ([FromServices] PlayerService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetPlayerTournamentsAsync(id, pagination);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapGet("/api/Players/{id}/tournament-history", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] PlayerService service, int id) => {
            var result = await service.GetPlayerTournamentHistoryAsync(id);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Player not found"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/me/player-profile", [Authorize] async (ClaimsPrincipal user, [FromServices] PlayerService service, PlayerPostDTO playerDto) => {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Results.Unauthorized();

            var result = await service.CreatePlayerForUserAsync(userId, playerDto);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "PlayerProfileAlreadyExists" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Created($"/Players/{result.Value?.Id}", result.Value);
        });

        // Seccion Tournaments
        app.MapGet("/api/Tournaments", async ([FromServices] TournamentService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllTournamentsAsync(pagination)));
        
        app.MapGet("/api/Tournaments/{id}", async ([FromServices] TournamentService service, int id) => {
            var tournament = await service.GetTournamentByIdAsync(id);
            return tournament == null ? Results.NotFound() : Results.Ok(tournament);
        });

        app.MapPost("/api/Tournaments", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, TournamentPostDTO tournamentDto) => {
            var tournament = await service.CreateTournamentAsync(tournamentDto);
            return Results.Created($"/Tournaments/{tournament.Id}", tournament);
        });

        app.MapPut("/api/Tournaments/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int id, TournamentPostDTO tournamentDto) => {
            var result = await service.UpdateTournamentAsync(id, tournamentDto);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // New endpoint for setting tournament status
        app.MapPut("/api/Tournaments/{id}/status", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int id, [FromBody] Api.Models.Enums.TournamentStatus newStatus) => {
            var result = await service.SetTournamentStatusAsync(id, newStatus);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Tournament not found"),
                    "InvalidStatusTransition" => Results.BadRequest(result.Error?.Description ?? "Invalid status transition"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Bad request")
                };
            }
            return Results.NoContent();
        });

        // New endpoint for generating scorecards for all tournament players
        app.MapPost("/api/Tournaments/{id}/generate-scorecards", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int id) => {
            var result = await service.GenerateScorecardsForTournamentAsync(id);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description ?? "Tournament not found"),
                    "InvalidTournamentStatus" => Results.BadRequest(result.Error.Description ?? "Invalid tournament status"),
                    "NoPlayersRegistered" => Results.BadRequest(result.Error.Description ?? "No players registered"),
                    "DefaultCourseNotFound" => Results.BadRequest(result.Error.Description ?? "Default course not found"),
                    "ScorecardGenerationFailed" => Results.Problem(result.Error.Description ?? "Scorecard generation failed", statusCode: 500),
                    _ => Results.BadRequest(result.Error.Description ?? "Bad request")
                };
            }
            return Results.Ok(new { message = "Scorecards generated successfully" });
        });

        app.MapDelete("/api/Tournaments/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int id) => {
            var result = await service.DeleteTournamentAsync(id);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapPost("/api/tournaments/{tournamentId}/register", [Authorize(Policy = "PlayerPolicy")] async (ClaimsPrincipal user, [FromServices] TournamentService service, int tournamentId) => {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Results.Unauthorized();

            var result = await service.RegisterCurrentUserToTournamentAsync(tournamentId, userId);
            if (!result.IsSuccess)
            {
                 return result.Error?.Code switch
                {
                    "PlayerProfileNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"), // Should not happen if profile is found
                    "PlayerAlreadyInTournament" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    "TournamentNotOpenForRegistration" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapGet("/api/Tournaments/{id}/Players", async ([FromServices] TournamentService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetTournamentPlayersAsync(id, pagination);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int tournamentId, int playerId) => {
            var result = await service.AddPlayerToTournamentAsync(tournamentId, playerId);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerAlreadyInTournament" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    "TournamentNotOpenForRegistration" => Results.BadRequest(result.Error?.Description ?? "Error occurred"), // Added new error case
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapDelete("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int tournamentId, int playerId) => {
            var result = await service.RemovePlayerFromTournamentAsync(tournamentId, playerId);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Tournaments/{id}/Categories", async ([FromServices] TournamentService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetTournamentCategoriesAsync(id, pagination);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });
        
        app.MapPost("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int tournamentId, int categoryId) => {
            var result = await service.AddCategoryToTournamentAsync(tournamentId, categoryId);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "CategoryAlreadyInTournament" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });
        app.MapDelete("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int tournamentId, int categoryId) => {
            var result = await service.RemoveCategoryFromTournamentAsync(tournamentId, categoryId);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/tournaments/{id}/rounds", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] RoundService service, int id) => {
            var result = await service.GetTournamentRoundsAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/tournaments/{id}/rounds", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundService service, int id) => {
            var result = await service.CreateRoundsForTournament(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "RoundsAlreadyExist" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok("Rounds created successfully.");
        });

        app.MapPost("/api/tournaments/{id}/generate-teetimes", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundService service, int id) => {
            var result = await service.GenerateTeeTimes(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "RoundInfoMissing" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    "NoPlayersInTournament" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    "NoRoundsForTournament" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapGet("/api/tournaments/{id}/teetimes", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] RoundService service, int id) => {
            var result = await service.GetTeeTimes(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "NoTeeTimes" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPut("/api/rounds/{roundId}/players/{playerId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundService service, int roundId, int playerId, [FromBody] TeeTimeDTO teeTimeUpdate) => {
            var result = await service.UpdateTeeTime(roundId, playerId, teeTimeUpdate.TeeTime ?? TimeSpan.Zero, teeTimeUpdate.StartingHole ?? 1);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "PlayerRoundNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapGet("/api/Tournaments/{id}/Scorecards", async ([FromServices] TournamentService service, int id) => Results.Ok(await service.GetTournamentScorecardsAsync(id)));

        app.MapGet("/api/Tournaments/Active", async ([FromServices] TournamentService service) => Results.Ok(await service.GetActiveTournamentsAsync()));
        app.MapGet("/api/Tournaments/Completed", async ([FromServices] TournamentService service) => Results.Ok(await service.GetCompletedTournamentsAsync()));

        app.MapGet("/api/Tournaments/{id}/rankings", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] ResultService service, int id) => {
            var rankings = await service.GetTournamentRankingAsync(id);
            return Results.Ok(rankings);
        });

        app.MapPost("/api/Tournaments/{id}/CalculateResults", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] TournamentService service, int id) => {
            var rankings = await service.CalculateTournamentResultsAsync(id);
            return Results.Ok(rankings);
        });

        // Seccion Categories
        app.MapGet("/api/Categories", async ([FromServices] CategoryService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllCategoriesAsync(pagination)));
        
        app.MapGet("/api/Categories/{id}", async ([FromServices] CategoryService service, int id) => {
            var category = await service.GetCategoryByIdAsync(id);
            return category == null ? Results.NotFound() : Results.Ok(category);
        });

        app.MapPost("/api/Categories", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CategoryService service, CategoryPostDTO categoryDto) => {
            var category = await service.CreateCategoryAsync(categoryDto);
            return Results.Created($"/Categories/{category.Id}", category);
        });

        app.MapPut("/api/Categories/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CategoryService service, int id, CategoryPostDTO categoryDto) => {
            var result = await service.UpdateCategoryAsync(id, categoryDto);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Categories/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CategoryService service, int id) => {
            var result = await service.DeleteCategoryAsync(id);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Categories/{id}/Players", async ([FromServices] CategoryService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetCategoryPlayersAsync(id, pagination);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Categories/{id}/Players/{playerId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] CategoryService service, int id, int playerId) => {
            var result = await service.AddPlayerToCategoryAsync(id, playerId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerAlreadyInCategory" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapDelete("/api/Categories/{id}/Players/{playerId}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] CategoryService service, int id, int playerId) => {
            var result = await service.RemovePlayerFromCategoryAsync(id, playerId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "PlayerNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapPost("/api/Categories/{id}/SetOpenCourse/{courseId}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CategoryService service, int id, int courseId) => {
            var result = await service.SetOpenCourseAsync(id, courseId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapPost("/api/Categories/{id}/SetLadiesCourse/{courseId}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CategoryService service, int id, int courseId) => {
            var result = await service.SetLadiesCourseAsync(id, courseId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // Seccion Courses
        app.MapGet("/api/Courses", async ([FromServices] CourseService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllCoursesAsync(pagination)));
        
        app.MapGet("/api/Courses/{id}", async ([FromServices] CourseService service, int id) => {
            var course = await service.GetCourseByIdAsync(id);
            return course == null ? Results.NotFound() : Results.Ok(course);
        });

        app.MapPost("/api/Courses", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CourseService service, CoursePostDTO courseDto) => {
            var course = await service.CreateCourseAsync(courseDto);
            return Results.Created($"/Courses/{course.Id}", course);
        });

        app.MapPut("/api/Courses/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CourseService service, int id, CoursePostDTO courseDto) => {
            var result = await service.UpdateCourseAsync(id, courseDto);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Courses/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CourseService service, int id) => {
            var result = await service.DeleteCourseAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Courses/{id}/Holes", async ([FromServices] CourseService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetCourseHolesAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Courses/{id}/Holes", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CourseService service, int id, HolePostDTO holeDto) => {
            var result = await service.AddHoleToCourseAsync(id, holeDto);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Courses/{id}/Holes/{holeId}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] CourseService service, int id, int holeId) => {
            var result = await service.RemoveHoleFromCourseAsync(id, holeId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "HoleNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        

        // Seccion Holes
        app.MapGet("/api/Holes", async ([FromServices] HoleService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllHolesAsync(pagination)));
        
        app.MapGet("/api/Holes/{id}", async ([FromServices] HoleService service, int id) => {
            var hole = await service.GetHoleByIdAsync(id);
            return hole == null ? Results.NotFound() : Results.Ok(hole);
        });

        app.MapPost("/api/Holes", [Authorize(Policy = "AdminPolicy")] async ([FromServices] HoleService service, HolePostDTO holeDto) => {
            var hole = await service.CreateHoleAsync(holeDto);
            return Results.Created($"/Holes/{hole.Id}", hole);
        });

        app.MapPut("/api/Holes/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] HoleService service, int id, HolePostDTO holeDto) => {
            var result = await service.UpdateHoleAsync(id, holeDto);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "HoleNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Holes/{id}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] HoleService service, int id) => {
            var result = await service.DeleteHoleAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "HoleNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // Seccion Scorecard
        app.MapGet("/api/Scorecards/Tournament/{tournamentId}", async ([FromServices] ScorecardService service, int tournamentId, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetAllScorecardsAsync(tournamentId, pagination);
            if (!result.IsSuccess)
            {
                if (result.Error == null) return Results.BadRequest("An unexpected error occurred.");
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok(result.Value);
        });
        
        app.MapGet("/api/Scorecards/{id}", async ([FromServices] ScorecardService service, int id) => {
            var scorecard = await service.GetScorecardByIdAsync(id);
            return scorecard == null ? Results.NotFound() : Results.Ok(scorecard);
        });

        app.MapPost("/api/Scorecards", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] ScorecardService service, ScorecardPostDTO scorecardDto) => {
            var createdScorecard = await service.CreateScorecardAsync(scorecardDto);
            return Results.Created($"/Scorecards/{createdScorecard.Id}", createdScorecard);
        });

        app.MapPut("/api/Scorecards/{id}", [Authorize(Policy = "ManageOwnScorecard")] async ([FromServices] ScorecardService service, int id, ScorecardPostDTO scorecardDto) => {
            var result = await service.UpdateScorecardAsync(id, scorecardDto);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "ScorecardNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // New endpoint for locking scorecards
        app.MapPut("/api/Scorecards/{id}/lock", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] ScorecardService service, int id) => {
            var result = await service.LockScorecardAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "ScorecardNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "ScorecardAlreadyLocked" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Scorecards/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] ScorecardService service, int id) => {
            var result = await service.DeleteScorecardAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "ScorecardNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // Seccion ScorecardResult
        app.MapGet("/api/ScorecardResults/{scorecardId}/{holeId}", async ([FromServices] ScorecardResultService service, int scorecardId, int holeId) => {
            var scorecardResult = await service.GetScorecardResultAsync(scorecardId, holeId);
            return scorecardResult == null ? Results.NotFound() : Results.Ok(scorecardResult);
        });
        app.MapPut("/api/ScorecardResults/{scorecardId}/{holeId}", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] ScorecardResultService service, int scorecardId, int holeId, ScorecardResultPostDTO scorecardResultDto) => {
            var result = await service.UpdateScorecardResultAsync(scorecardId, holeId, scorecardResultDto);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "ScorecardResultNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });
        app.MapDelete("/api/ScorecardResults/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] ScorecardResultService service, int id) => {
            var result = await service.DeleteScorecardResultAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "ScorecardResultNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // Seccion Results
        app.MapGet("/api/TournamentRankings/{tournamentId}", async ([FromServices] ResultService service, int tournamentId) => Results.Ok(await service.GetTournamentRankingAsync(tournamentId)));


        // Seccion RoundsInfo
        app.MapGet("/api/RoundsInfo", async ([FromServices] RoundInfoService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllRoundInfoAsync(pagination)));
        app.MapGet("/api/RoundsInfo/{id}", async ([FromServices] RoundInfoService service, int id) => {
            var roundInfo = await service.GetRoundInfoAsync(id);
            return roundInfo == null ? Results.NotFound() : Results.Ok(roundInfo);
        });
        app.MapPost("/api/RoundsInfo", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundInfoService service, RoundInfo roundInfo) => {
            var createdRoundInfo = await service.CreateRoundInfoAsync(roundInfo);
            return Results.Created($"/RoundsInfo/{createdRoundInfo.Id}", createdRoundInfo);
        });
        app.MapPut("/api/RoundsInfo/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundInfoService service, int id, RoundInfo roundInfo) => {
            var result = await service.UpdateRoundInfoAsync(id, roundInfo);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "RoundInfoNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });
        app.MapDelete("/api/RoundsInfo/{id}", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] RoundInfoService service, int id) => {
            var result = await service.DeleteRoundInfoAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "RoundInfoNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.NoContent();
        });

        // Seccion Match Play
        app.MapPost("/api/tournaments/{tournamentId}/generate-matches", [Authorize(Policy = "TournamentOrganizerPolicy")] async ([FromServices] MatchService service, int tournamentId) => {
            var result = await service.GenerateMatchesAsync(tournamentId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "InvalidTournamentType" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    "NotEnoughPlayers" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    "MatchesAlreadyExist" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Error occurred")
                };
            }
            return Results.Ok("Matches generated successfully.");
        });

        app.MapGet("/api/tournaments/{tournamentId}/matches", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] MatchService service, int tournamentId) => {
            var result = await service.GetMatchesForTournamentAsync(tournamentId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "NoMatchesFound" => Results.NotFound(result.Error?.Description ?? "No matches found"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Bad request")
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/matches/{matchId}/holes", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] MatchService service, int matchId, [FromBody] PostMatchHoleResultDTO dto) => {
            var result = await service.RecordHoleResultAsync(matchId, dto.HoleId, dto.WinningPlayerId);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "MatchNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "MatchCompleted" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    "InvalidWinner" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Unknown error")
                };
            }
            return Results.Ok(result.Value);
        });

        // Seccion Roles y Usuarios
        app.MapPost("/api/roles/{roleName}", [Authorize(Policy = "AdminPolicy")] async ([FromServices] RoleService service, string roleName) => {
            var result = await service.CreateRoleAsync(roleName);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "RoleAlreadyExists" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Unknown error")
                };
            }
            return Results.Ok($"Role {roleName} created successfully.");
        });

        app.MapPost("/api/users/{userId}/roles", [Authorize(Policy = "AdminPolicy")] async ([FromServices] RoleService service, string userId, [FromBody] RoleAssignmentDTO roleDto) => {
            var result = await service.AssignUserToRoleAsync(userId, roleDto.RoleName);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "UserNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "RoleNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "UserAlreadyInRole" => Results.Conflict(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Unknown error")
                };
            }
            return Results.Ok($"Role {roleDto.RoleName} assigned to user {userId}.");
        });

        app.MapGet("/api/users/{userId}/roles", [Authorize(Policy = "AdminPolicy")] async ([FromServices] RoleService service, string userId) => {
            var roles = await service.GetUserRolesAsync(userId);
            return Results.Ok(roles);
        });

        app.MapDelete("/api/users/{userId}/roles", [Authorize(Policy = "AdminPolicy")] async ([FromServices] RoleService service, string userId, [FromBody] RoleAssignmentDTO roleDto) => {
            var result = await service.RemoveUserFromRoleAsync(userId, roleDto.RoleName);
            if (!result.IsSuccess)
            {
                return result.Error?.Code switch
                {
                    "UserNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "RoleNotFound" => Results.NotFound(result.Error?.Description ?? "Error occurred"),
                    "UserNotInRole" => Results.BadRequest(result.Error?.Description ?? "Error occurred"),
                    _ => Results.BadRequest(result.Error?.Description ?? "Unknown error")
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/users", [Authorize(Policy = "AdminPolicy")] async ([FromServices] RoleService service) => {
            var users = await service.GetAllUsersAsync();
            return Results.Ok(users);
        });

        // Dashboard endpoints
        app.MapGet("/api/dashboard/stats", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] DashboardService service) => {
            var stats = await service.GetDashboardStatsAsync();
            return Results.Ok(stats);
        });

        app.MapGet("/api/dashboard/activity", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] DashboardService service, int limit = 10) => {
            var activity = await service.GetRecentActivityAsync(limit);
            return Results.Ok(activity);
        });

        app.MapGet("/api/dashboard/tournament/{id}/activity", [Authorize(Policy = "PlayerPolicy")] async ([FromServices] DashboardService service, int id) => {
            var activity = await service.GetTournamentActivityAsync(id);
            return Results.Ok(activity);
        });

        // Seed demo data endpoint
        app.MapPost("/api/seed-demo-data", [Authorize] async ([FromServices] DemoDataService demoDataService) => {
            await demoDataService.SeedDemoDataAsync();
            return Results.Ok("Demo data seeded successfully");
        });

        // Seed demo data on startup
        using (var scope = app.Services.CreateScope())
        {
            var demoDataService = scope.ServiceProvider.GetRequiredService<DemoDataService>();
            await demoDataService.SeedDemoDataAsync();
        }

        app.Run();
    }
}
