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
                  builder.WithOrigins("http://localhost:5001") // Changed from "*"
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
        app.MapGet("/api/Players", async (PlayerService service) => Results.Ok(await service.GetAllPlayersAsync()));
        
        app.MapGet("/api/Players/{id}", async (PlayerService service, int id) => {
            var player = await service.GetPlayerByIdAsync(id);
            return player == null ? Results.NotFound() : Results.Ok(player);
        });

        app.MapPost("/api/Players", [Authorize] async (PlayerService service, PLayerPostDTO playerDto) => {
            var (player, error) = await service.CreatePlayerAsync(playerDto);
            if (error != null) return Results.BadRequest(error);
            return Results.Created($"/Players/{player.Id}", player);
        });

        app.MapPut("/api/Players/{id}", [Authorize] async (PlayerService service, int id, PLayerPostDTO playerDto) => {
            var success = await service.UpdatePlayerAsync(id, playerDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Players/{id}", [Authorize] async (PlayerService service, int id) => {
            var success = await service.DeletePlayerAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });
        app.MapGet("/api/Players/{id}/Tournaments", async (PlayerService service, int id) => Results.Ok(await service.GetPlayerTournamentsAsync(id)));

        // Seccion Tournaments
        app.MapGet("/api/Tournaments", async (TournamentService service) => Results.Ok(await service.GetAllTournamentsAsync()));
        
        app.MapGet("/api/Tournaments/{id}", async (TournamentService service, int id) => {
            var tournament = await service.GetTournamentByIdAsync(id);
            return tournament == null ? Results.NotFound() : Results.Ok(tournament);
        });

        app.MapPost("/api/Tournaments", [Authorize] async (TournamentService service, TournamentPostDTO tournamentDto) => {
            var tournament = await service.CreateTournamentAsync(tournamentDto);
            return Results.Created($"/Tournaments/{tournament.Id}", tournament);
        });

        app.MapPut("/api/Tournaments/{id}", [Authorize] async (TournamentService service, int id, TournamentPostDTO tournamentDto) => {
            var success = await service.UpdateTournamentAsync(id, tournamentDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Tournaments/{id}", [Authorize] async (TournamentService service, int id) => {
            var success = await service.DeleteTournamentAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapGet("/api/Tournaments/{id}/Players", async (TournamentService service, int id) => Results.Ok(await service.GetTournamentPlayersAsync(id)));

        app.MapPost("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize] async (TournamentService service, int tournamentId, int playerId) => {
            var (player, error) = await service.AddPlayerToTournamentAsync(tournamentId, playerId);
            if (error != null) return Results.BadRequest(error);
            return Results.Ok(player);
        });

        app.MapDelete("/api/Tournaments/{tournamentId}/Players/{playerId}", [Authorize] async (TournamentService service, int tournamentId, int playerId) => {
            var success = await service.RemovePlayerFromTournamentAsync(tournamentId, playerId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapGet("/api/Tournaments/{id}/Categories", async (TournamentService service, int id) => Results.Ok(await service.GetTournamentCategoriesAsync(id)));
        
        app.MapPost("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize] async (TournamentService service, int tournamentId, int categoryId) => {
            var (category, error) = await service.AddCategoryToTournamentAsync(tournamentId, categoryId);
            if (error != null) return Results.BadRequest(error);
            return Results.Ok(category);
        });
        app.MapDelete("/api/Tournaments/{tournamentId}/Categories/{categoryId}", [Authorize] async (TournamentService service, int tournamentId, int categoryId) => {
            var success = await service.RemoveCategoryFromTournamentAsync(tournamentId, categoryId);
            return success ? Results.NoContent() : Results.NotFound();
        });
        app.MapGet("/api/Tournaments/{id}/Scorecards", async (TournamentService service, int id) => Results.Ok(await service.GetTournamentScorecardsAsync(id)));

        app.MapGet("/api/Tournaments/Active", async (TournamentService service) => Results.Ok(await service.GetActiveTournamentsAsync()));
        app.MapGet("/api/Tournaments/Completed", async (TournamentService service) => Results.Ok(await service.GetCompletedTournamentsAsync()));

        // Seccion Categories
        app.MapGet("/api/Categories", async (CategoryService service) => Results.Ok(await service.GetAllCategoriesAsync()));
        
        app.MapGet("/api/Categories/{id}", async (CategoryService service, int id) => {
            var category = await service.GetCategoryByIdAsync(id);
            return category == null ? Results.NotFound() : Results.Ok(category);
        });

        app.MapPost("/api/Categories", [Authorize] async (CategoryService service, CategoryPostDTO categoryDto) => {
            var category = await service.CreateCategoryAsync(categoryDto);
            return Results.Created($"/Categories/{category.Id}", category);
        });

        app.MapPut("/api/Categories/{id}", [Authorize] async (CategoryService service, int id, CategoryPostDTO categoryDto) => {
            var success = await service.UpdateCategoryAsync(id, categoryDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Categories/{id}", [Authorize] async (CategoryService service, int id) => {
            var success = await service.DeleteCategoryAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapGet("/api/Categories/{id}/Players", async (CategoryService service, int id) => Results.Ok(await service.GetCategoryPlayersAsync(id)));

        app.MapPost("/api/Categories/{id}/Players/{playerId}", [Authorize] async (CategoryService service, int id, int playerId) => {
            var (player, error) = await service.AddPlayerToCategoryAsync(id, playerId);
            if (error != null) return Results.BadRequest(error);
            return Results.Ok(player);
        });

        app.MapDelete("/api/Categories/{id}/Players/{playerId}", [Authorize] async (CategoryService service, int id, int playerId) => {
            var success = await service.RemovePlayerFromCategoryAsync(id, playerId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapPost("/api/Categories/{id}/SetOpenCourse/{courseId}", [Authorize] async (CategoryService service, int id, int courseId) => {
            var success = await service.SetOpenCourseAsync(id, courseId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapPost("/api/Categories/{id}/SetLadiesCourse/{courseId}", [Authorize] async (CategoryService service, int id, int courseId) => {
            var success = await service.SetLadiesCourseAsync(id, courseId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        // Seccion Courses
        app.MapGet("/api/Courses", async (CourseService service) => Results.Ok(await service.GetAllCoursesAsync()));
        
        app.MapGet("/api/Courses/{id}", async (CourseService service, int id) => {
            var course = await service.GetCourseByIdAsync(id);
            return course == null ? Results.NotFound() : Results.Ok(course);
        });

        app.MapPost("/api/Courses", [Authorize] async (CourseService service, CoursePostDTO courseDto) => {
            var course = await service.CreateCourseAsync(courseDto);
            return Results.Created($"/Courses/{course.Id}", course);
        });

        app.MapPut("/api/Courses/{id}", [Authorize] async (CourseService service, int id, CoursePostDTO courseDto) => {
            var success = await service.UpdateCourseAsync(id, courseDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Courses/{id}", [Authorize] async (CourseService service, int id) => {
            var success = await service.DeleteCourseAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapGet("/api/Courses/{id}/Holes", async (CourseService service, int id) => Results.Ok(await service.GetCourseHolesAsync(id)));

        app.MapPost("/api/Courses/{id}/Holes", [Authorize] async (CourseService service, int id, HolePostDTO holeDto) => {
            var success = await service.AddHoleToCourseAsync(id, holeDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Courses/{id}/Holes/{holeId}", [Authorize] async (CourseService service, int id, int holeId) => {
            var success = await service.RemoveHoleFromCourseAsync(id, holeId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        

        // Seccion Holes
        app.MapGet("/api/Holes", async (HoleService service) => Results.Ok(await service.GetAllHolesAsync()));
        
        app.MapGet("/api/Holes/{id}", async (HoleService service, int id) => {
            var hole = await service.GetHoleByIdAsync(id);
            return hole == null ? Results.NotFound() : Results.Ok(hole);
        });

        app.MapPost("/api/Holes", [Authorize] async (HoleService service, HolePostDTO holeDto) => {
            var hole = await service.CreateHoleAsync(holeDto);
            return Results.Created($"/Holes/{hole.Id}", hole);
        });

        app.MapPut("/api/Holes/{id}", [Authorize] async (HoleService service, int id, HolePostDTO holeDto) => {
            var success = await service.UpdateHoleAsync(id, holeDto);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Holes/{id}", [Authorize] async (HoleService service, int id) => {
            var success = await service.DeleteHoleAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        // Seccion Scorecard
        app.MapGet("/api/Scorecards/{tournamentId}", async (ScorecardService service, int tournamentId) => Results.Ok(await service.GetAllScorecardsAsync(tournamentId)));
        
        app.MapGet("/api/Scorecards/{id}", async (ScorecardService service, int id) => {
            var scorecard = await service.GetScorecardByIdAsync(id);
            return scorecard == null ? Results.NotFound() : Results.Ok(scorecard);
        });

        app.MapPost("/api/Scorecards", [Authorize] async (ScorecardService service, Scorecard scorecard) => {
            var createdScorecard = await service.CreateScorecardAsync(scorecard);
            return Results.Created($"/Scorecards/{createdScorecard.Id}", createdScorecard);
        });

        app.MapPut("/api/Scorecards/{id}", [Authorize] async (ScorecardService service, int id, Scorecard scorecard) => {
            var success = await service.UpdateScorecardAsync(id, scorecard);
            return success ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/Scorecards/{id}", [Authorize] async (ScorecardService service, int id) => {
            var success = await service.DeleteScorecardAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        // Seccion ScorecardResult
        app.MapGet("/api/ScorecardResults/{scorecardId}/{holeId}", async (ScorecardResultService service, int scorecardId, int holeId) => {
            var scorecardResult = await service.GetScorecardResultAsync(scorecardId, holeId);
            return scorecardResult == null ? Results.NotFound() : Results.Ok(scorecardResult);
        });
        app.MapPut("/api/ScorecardResults/{scorecardId}/{holeId}", [Authorize] async (ScorecardResultService service, int scorecardId, int holeId, ScorecardResultPostDTO scorecardResultDto) => {
            var success = await service.UpdateScorecardResultAsync(scorecardId, holeId, scorecardResultDto);
            return success ? Results.NoContent() : Results.NotFound();
        });
        app.MapDelete("/api/ScorecardResults/{id}", [Authorize] async (ScorecardResultService service, int id) => {
            var success = await service.DeleteScorecardResultAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });

        // Seccion Results
        app.MapGet("/api/TournamentRankings/{tournamentId}", async (ResultService service, int tournamentId) => Results.Ok(await service.GetTournamentRankingAsync(tournamentId)));


        // Seccion RoundsInfo
        app.MapGet("/api/RoundsInfo", async (RoundInfoService service) => Results.Ok(await service.GetAllRoundInfoAsync()));
        app.MapGet("/api/RoundsInfo/{id}", async (RoundInfoService service, int id) => {
            var roundInfo = await service.GetRoundInfoAsync(id);
            return roundInfo == null ? Results.NotFound() : Results.Ok(roundInfo);
        });
        app.MapPost("/api/RoundsInfo", [Authorize] async (RoundInfoService service, RoundInfo roundInfo) => {
            var createdRoundInfo = await service.CreateRoundInfoAsync(roundInfo);
            return Results.Created($"/RoundsInfo/{createdRoundInfo.Id}", createdRoundInfo);
        });
        app.MapPut("/api/RoundsInfo/{id}", [Authorize] async (RoundInfoService service, int id, RoundInfo roundInfo) => {
            var success = await service.UpdateRoundInfoAsync(id, roundInfo);
            return success ? Results.NoContent() : Results.NotFound();
        });
        app.MapDelete("/api/RoundsInfo/{id}", [Authorize] async (RoundInfoService service, int id) => {
            var success = await service.DeleteRoundInfoAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        });
        app.Run();
    }
}