using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Api.Models.DTOs.CategoryDTOs;


internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Configuration["Urls"] = "http://*:5001";
        builder.Services.AddDbContext<BgContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
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
                  builder.WithOrigins("*")
                  .AllowAnyOrigin()
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
        app.MapGet("/api/Players", Player.GetAllPlayers);
        app.MapGet("/api/Players/{id}", Player.GetPlayer);
        app.MapPost("/api/Players", Player.CreatePlayer);
        app.MapPut("/api/Players/{id}", Player.UpdatePlayer);
        app.MapDelete("/api/Players/{id}", Player.DeletePlayer);
        app.MapGet("/api/Players/{id}/Tournaments", Player.GetPlayerTournaments);

        // Seccion Tournaments
        app.MapGet("/api/Tournaments", Tournament.GetAllTournaments);
        app.MapGet("/api/Tournaments/{id}", Tournament.GetTournament);
        app.MapPost("/api/Tournaments", Tournament.CreateTournament);
        app.MapPut("/api/Tournaments/{id}", Tournament.UpdateTournament);
        app.MapDelete("/api/Tournaments/{id}", Tournament.DeleteTournament);
        app.MapPost("/api/Tournaments/{id}/Players", Tournament.AddTournamentPlayer);
        app.MapDelete("/api/Tournaments/{id}/Players/{playerid}", Tournament.DeleteTournamentPlayer);
        app.MapGet("/api/Tournaments/{id}/Players", Tournament.GetTournamentPlayers);
        app.MapGet("/api/Tournaments/{id}/Categories", Tournament.GetTournamentCategories);
        app.MapPost("/api/Tournaments/{id}/Categories", Tournament.AddTournamentCategory);
        app.MapDelete("/api/Tournaments/{id}/Categories/{categoryid}", Tournament.DeleteTournamentCategory);
        app.MapGet("/api/Tournaments/{id}/Scorecards", Tournament.GetTournamentScorecards);

        // Seccion Categories
        app.MapGet("/api/Categories", Category.GetAllCategories);
        app.MapGet("/api/Categories/{id}", Category.GetCategory);
        app.MapPost("/api/Categories", Category.CreateCategory);
        app.MapPut("/api/Categories/{id}", Category.UpdateCategory);
        app.MapDelete("/api/Categories/{id}", Category.DeleteCategory);
        app.MapPost("/api/Categories/{id}/Players", Category.AddCategoryPlayer);
        app.MapGet("/api/Categories/{id}/Players", Category.GetCategoryPlayers);
        app.MapDelete("/api/Categories/{id}/Players/{playerid}", Category.DeleteCategoryPlayer);
        //app.MapGet("/api/Categories/SeparateLadies/{id}", Category.UpdateSeperateLadies);
        //app.MapPost("/api/Categories/SeparateAge/{id}", Category.UpdateSeparateAgeCategories);
        //app.MapPost("/api/Categories/SeparateHandicap/{id}", Category.UpdateSeparateHcapCategories);
        app.MapPost("/api/Categories/{id}/SetOpenCourse", Category.SetOpenCourse);
        app.MapPost("/api/Categories/{id}/SetLadiesCourse", Category.SetLadiesCourse);

        // Seccion Courses
        app.MapGet("/api/Courses", Course.GetAllCourses);
        app.MapGet("/api/Courses/{id}", Course.GetCourse);
        app.MapPost("/api/Courses", Course.CreateCourse);
        app.MapPut("/api/Courses/{id}", Course.UpdateCourse);
        app.MapDelete("/api/Courses/{id}", Course.DeleteCourse);
        app.MapDelete("/api/Courses/{id}/Holes/{holeid}", Course.DeleteCourseHole);
        app.MapPost("/api/Courses/{id}/Holes", Course.AddCourseHole);
        app.MapGet("/api/Courses/{id}/Holes", Course.GetCourseHoles);

        // Seccion Holes
        //app.MapGet("/api/Holes", Hole.GetAllHoles);
        //app.MapGet("/api/Holes/{id}", Hole.GetHole);
        //app.MapPost("/api/Holes", Hole.CreateHole);
        app.MapPut("/api/Holes/{id}", Hole.UpdateHole);
        //app.MapDelete("/api/Holes/{id}", Hole.DeleteHole);

        // Seccion Scorecard
        app.MapGet("/api/Scorecards/{tournamentId}", Scorecard.GetAllScorecards);
        //app.MapGet("/api/Scorecards/{id}", Scorecard.GetScorecard);
        //app.MapPost("/api/Scorecards", Scorecard.CreateScorecard);
        //app.MapPut("/api/Scorecards/{id}", Scorecard.UpdateScorecard);
        app.MapDelete("/api/Scorecards/{id}", Scorecard.DeleteScorecard);

        // Seccion ScorecardResult
        app.MapGet("/api/ScorecardResults/{scorecardId}/{holeId}", ScorecardResult.GetScorecardResult);
        app.MapPut("/api/ScorecardResults/{scorecardId}/{holeId}", ScorecardResult.UpdateScorecardResult);
        //app.MapDelete("/api/ScorecardResults/{id}", ScorecardResult.DeleteScorecardResult);

        // Seccion Results
        app.MapGet("/api/TournamentRankings/{tournamentId}", Result.GetTournamentRanking);


        // Seccion RoundsInfo
        /*
        app.MapGet("/api/RounsdInfo", RoundInfo.GetAllRoundInfo);
        app.MapGet("/api/RoundsInfo/{id}", RoundInfo.GetRoundInfo);
        app.MapPost("/api/RoundsInfo", RoundInfo.CreateRoundInfo);
        app.MapPut("/api/RounsdInfo/{id}", RoundInfo.UpdateRoundInfo);
        app.MapDelete("/api/RounsdInfo/{id}", RoundInfo.DeleteRoundInfo);
        */
        app.Run();
    }
}