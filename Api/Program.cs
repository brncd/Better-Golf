using Api.Data;
using Api.Models;
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
using Api.Models.DTOs.ScorecardDTOs;
using Api.Models.Common;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Configuration["Urls"] = "http://*:5001";
        builder.Services.AddDbContext<BgContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
        
        builder.Services.AddIdentityApiEndpoints<IdentityUser>() // Added
            .AddEntityFrameworkStores<BgContext>(); // Added

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

        builder.Services.AddAuthorization(); // Added

        builder.Services.AddScoped<PlayerService>();
        builder.Services.AddScoped<TournamentService>();
        builder.Services.AddScoped<CategoryService>();
        builder.Services.AddScoped<CourseService>();
        builder.Services.AddScoped<ScorecardResultService>();
        builder.Services.AddScoped<ResultService>();
        builder.Services.AddScoped<RoundInfoService>();

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
                  builder.WithOrigins("http://localhost:3000") // Changed from "http://localhost:5001"
                  .AllowAnyMethod()
                  .AllowAnyHeader();
              });
        });
        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v0.1/swagger.json", "Beter Golf API beta");
        });

        app.UseCors("TodoPasa");

        app.UseAuthentication(); // Added
        app.UseAuthorization();  // Added

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
        app.MapGet("/api/Players", async ([FromServices] PlayerService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllPlayersAsync(pagination)));
        
        app.MapGet("/api/Players/{id}", async ([FromServices] PlayerService service, int id) => {
            var player = await service.GetPlayerByIdAsync(id);
            return player == null ? Results.NotFound() : Results.Ok(player);
        });

        app.MapPost("/api/Players", [Authorize] async ([FromServices] PlayerService service, PLayerPostDTO playerDto) => {
            var result = await service.CreatePlayerAsync(playerDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "PlayerAlreadyExists" => Results.Conflict(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Created($"/Players/{result.Value.Id}", result.Value);
        });

        app.MapPut("/api/Players/{id}", [Authorize] async ([FromServices] PlayerService service, int id, PLayerPostDTO playerDto) => {
            var result = await service.UpdatePlayerAsync(id, playerDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Players/{id}", [Authorize] async ([FromServices] PlayerService service, int id) => {
            var result = await service.DeletePlayerAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });
        app.MapGet("/api/Players/{id}/Tournaments", async ([FromServices] PlayerService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetPlayerTournamentsAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        // Seccion Tournaments
        app.MapGet("/api/Tournaments", async ([FromServices] TournamentService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllTournamentsAsync(pagination)));
        
        app.MapGet("/api/Tournaments/{id}", async ([FromServices] TournamentService service, int id) => {
            var tournament = await service.GetTournamentByIdAsync(id);
            return tournament == null ? Results.NotFound() : Results.Ok(tournament);
        });

        app.MapPost("/api/Tournaments", [Authorize] async ([FromServices] TournamentService service, TournamentPostDTO tournamentDto) => {
            var tournament = await service.CreateTournamentAsync(tournamentDto);
            return Results.Created($"/Tournaments/{tournament.Id}", tournament);
        });

        app.MapPut("/api/Tournaments/{id}", [Authorize] async ([FromServices] TournamentService service, int id, TournamentPostDTO tournamentDto) => {
            var result = await service.UpdateTournamentAsync(id, tournamentDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Tournaments/{id}", [Authorize] async ([FromServices] TournamentService service, int id) => {
            var result = await service.DeleteTournamentAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Tournaments/{id}/Players", async ([FromServices] TournamentService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetTournamentPlayersAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize] async ([FromServices] TournamentService service, int tournamentId, int playerId) => {
            var result = await service.AddPlayerToTournamentAsync(tournamentId, playerId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerAlreadyInTournament" => Results.Conflict(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapDelete("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize] async ([FromServices] TournamentService service, int tournamentId, int playerId) => {
            var result = await service.RemovePlayerFromTournamentAsync(tournamentId, playerId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Tournaments/{id}/Categories", async ([FromServices] TournamentService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetTournamentCategoriesAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });
        
        app.MapPost("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize] async ([FromServices] TournamentService service, int tournamentId, int categoryId) => {
            var result = await service.AddCategoryToTournamentAsync(tournamentId, categoryId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    "CategoryAlreadyInTournament" => Results.Conflict(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });
        app.MapDelete("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize] async ([FromServices] TournamentService service, int tournamentId, int categoryId) => {
            var result = await service.RemoveCategoryFromTournamentAsync(tournamentId, categoryId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });
        app.MapGet("/api/Tournaments/{id}/Scorecards", async ([FromServices] TournamentService service, int id) => Results.Ok(await service.GetTournamentScorecardsAsync(id)));

        app.MapGet("/api/Tournaments/Active", async ([FromServices] TournamentService service) => Results.Ok(await service.GetActiveTournamentsAsync()));
        app.MapGet("/api/Tournaments/Completed", async ([FromServices] TournamentService service) => Results.Ok(await service.GetCompletedTournamentsAsync()));

        app.MapPost("/api/Tournaments/{id}/CalculateResults", [Authorize] async ([FromServices] TournamentService service, int id) => {
            var rankings = await service.CalculateTournamentResultsAsync(id);
            return Results.Ok(rankings);
        });

        // Seccion Categories
        app.MapGet("/api/Categories", async ([FromServices] CategoryService service, [AsParameters] PaginationRequest pagination) => Results.Ok(await service.GetAllCategoriesAsync(pagination)));
        
        app.MapGet("/api/Categories/{id}", async ([FromServices] CategoryService service, int id) => {
            var category = await service.GetCategoryByIdAsync(id);
            return category == null ? Results.NotFound() : Results.Ok(category);
        });

        app.MapPost("/api/Categories", [Authorize] async ([FromServices] CategoryService service, CategoryPostDTO categoryDto) => {
            var category = await service.CreateCategoryAsync(categoryDto);
            return Results.Created($"/Categories/{category.Id}", category);
        });

        app.MapPut("/api/Categories/{id}", [Authorize] async ([FromServices] CategoryService service, int id, CategoryPostDTO categoryDto) => {
            var result = await service.UpdateCategoryAsync(id, categoryDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Categories/{id}", [Authorize] async ([FromServices] CategoryService service, int id) => {
            var result = await service.DeleteCategoryAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Categories/{id}/Players", async ([FromServices] CategoryService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetCategoryPlayersAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Categories/{id}/Players/{playerId}", [Authorize] async ([FromServices] CategoryService service, int id, int playerId) => {
            var result = await service.AddPlayerToCategoryAsync(id, playerId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerAlreadyInCategory" => Results.Conflict(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapDelete("/api/Categories/{id}/Players/{playerId}", [Authorize] async ([FromServices] CategoryService service, int id, int playerId) => {
            var result = await service.RemovePlayerFromCategoryAsync(id, playerId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    "PlayerNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapPost("/api/Categories/{id}/SetOpenCourse/{courseId}", [Authorize] async ([FromServices] CategoryService service, int id, int courseId) => {
            var result = await service.SetOpenCourseAsync(id, courseId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapPost("/api/Categories/{id}/SetLadiesCourse/{courseId}", [Authorize] async ([FromServices] CategoryService service, int id, int courseId) => {
            var result = await service.SetLadiesCourseAsync(id, courseId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CategoryNotFound" => Results.NotFound(result.Error.Description),
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
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

        app.MapPost("/api/Courses", [Authorize] async ([FromServices] CourseService service, CoursePostDTO courseDto) => {
            var course = await service.CreateCourseAsync(courseDto);
            return Results.Created($"/Courses/{course.Id}", course);
        });

        app.MapPut("/api/Courses/{id}", [Authorize] async ([FromServices] CourseService service, int id, CoursePostDTO courseDto) => {
            var result = await service.UpdateCourseAsync(id, courseDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Courses/{id}", [Authorize] async ([FromServices] CourseService service, int id) => {
            var result = await service.DeleteCourseAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapGet("/api/Courses/{id}/Holes", async ([FromServices] CourseService service, int id, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetCourseHolesAsync(id, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });

        app.MapPost("/api/Courses/{id}/Holes", [Authorize] async ([FromServices] CourseService service, int id, HolePostDTO holeDto) => {
            var result = await service.AddHoleToCourseAsync(id, holeDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Courses/{id}/Holes/{holeId}", [Authorize] async ([FromServices] CourseService service, int id, int holeId) => {
            var result = await service.RemoveHoleFromCourseAsync(id, holeId);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "CourseNotFound" => Results.NotFound(result.Error.Description),
                    "HoleNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
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

        app.MapPost("/api/Holes", [Authorize] async ([FromServices] HoleService service, HolePostDTO holeDto) => {
            var hole = await service.CreateHoleAsync(holeDto);
            return Results.Created($"/Holes/{hole.Id}", hole);
        });

        app.MapPut("/api/Holes/{id}", [Authorize] async ([FromServices] HoleService service, int id, HolePostDTO holeDto) => {
            var result = await service.UpdateHoleAsync(id, holeDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "HoleNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Holes/{id}", [Authorize] async ([FromServices] HoleService service, int id) => {
            var result = await service.DeleteHoleAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "HoleNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        // Seccion Scorecard
        app.MapGet("/api/Scorecards/Tournament/{tournamentId}", async ([FromServices] ScorecardService service, int tournamentId, [AsParameters] PaginationRequest pagination) => {
            var result = await service.GetAllScorecardsAsync(tournamentId, pagination);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "TournamentNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.Ok(result.Value);
        });
        
        app.MapGet("/api/Scorecards/{id}", async ([FromServices] ScorecardService service, int id) => {
            var scorecard = await service.GetScorecardByIdAsync(id);
            return scorecard == null ? Results.NotFound() : Results.Ok(scorecard);
        });

        app.MapPost("/api/Scorecards", [Authorize] async ([FromServices] ScorecardService service, ScorecardPostDTO scorecardDto) => {
            var createdScorecard = await service.CreateScorecardAsync(scorecardDto);
            return Results.Created($"/Scorecards/{createdScorecard.Id}", createdScorecard);
        });

        app.MapPut("/api/Scorecards/{id}", [Authorize] async ([FromServices] ScorecardService service, int id, ScorecardPostDTO scorecardDto) => {
            var result = await service.UpdateScorecardAsync(id, scorecardDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "ScorecardNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        app.MapDelete("/api/Scorecards/{id}", [Authorize] async ([FromServices] ScorecardService service, int id) => {
            var result = await service.DeleteScorecardAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "ScorecardNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });

        // Seccion ScorecardResult
        app.MapGet("/api/ScorecardResults/{scorecardId}/{holeId}", async ([FromServices] ScorecardResultService service, int scorecardId, int holeId) => {
            var scorecardResult = await service.GetScorecardResultAsync(scorecardId, holeId);
            return scorecardResult == null ? Results.NotFound() : Results.Ok(scorecardResult);
        });
        app.MapPut("/api/ScorecardResults/{scorecardId}/{holeId}", [Authorize] async ([FromServices] ScorecardResultService service, int scorecardId, int holeId, ScorecardResultPostDTO scorecardResultDto) => {
            var result = await service.UpdateScorecardResultAsync(scorecardId, holeId, scorecardResultDto);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "ScorecardResultNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });
        app.MapDelete("/api/ScorecardResults/{id}", [Authorize] async ([FromServices] ScorecardResultService service, int id) => {
            var result = await service.DeleteScorecardResultAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "ScorecardResultNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
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
        app.MapPost("/api/RoundsInfo", [Authorize] async ([FromServices] RoundInfoService service, RoundInfo roundInfo) => {
            var createdRoundInfo = await service.CreateRoundInfoAsync(roundInfo);
            return Results.Created($"/RoundsInfo/{createdRoundInfo.Id}", createdRoundInfo);
        });
        app.MapPut("/api/RoundsInfo/{id}", [Authorize] async ([FromServices] RoundInfoService service, int id, RoundInfo roundInfo) => {
            var result = await service.UpdateRoundInfoAsync(id, roundInfo);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "RoundInfoNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });
        app.MapDelete("/api/RoundsInfo/{id}", [Authorize] async ([FromServices] RoundInfoService service, int id) => {
            var result = await service.DeleteRoundInfoAsync(id);
            if (!result.IsSuccess)
            {
                return result.Error.Code switch
                {
                    "RoundInfoNotFound" => Results.NotFound(result.Error.Description),
                    _ => Results.BadRequest(result.Error.Description)
                };
            }
            return Results.NoContent();
        });
        app.Run();
    }
}