using Api.Data;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Api.Models.Engine;

namespace Api.Models;

public class Player
{
    public int Id { get; set; }
    public int MatriculaAUG { get; set; }
    public string Name { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public double HandicapIndex { get; set; }
    public DateOnly Birthdate { get; set; }
    public bool IsPreferredCategoryLadies { get; set; }
    public List<Tournament> Tournaments { get; set; } = new List<Tournament>();
    public List<Category> Categories { get; set; } = new List<Category>();
    public List<Scorecard> Scorecards { get; set; } = new List<Scorecard>();

    public Player(int matriculaAUG, string name, string lastName, float handicapIndex, bool isWoman)

    {
        MatriculaAUG = matriculaAUG;
        Name = name;
        LastName = lastName;
        HandicapIndex = handicapIndex;
        IsPreferredCategoryLadies = isWoman;
    }
    public Player(int matriculaAUG, string name, string lastName, float handicapIndex, bool isWoman, DateOnly birthday)
        : this(matriculaAUG, name, lastName, handicapIndex, isWoman)
    {
        Birthdate = birthday;
    }
    public Player(PLayerPostDTO playerdto)
    {
        Name = playerdto.Name;
	    MatriculaAUG = playerdto.MatriculaAUG;
        LastName = playerdto.LastName;
        HandicapIndex = playerdto.HandicapIndex;
        IsPreferredCategoryLadies = playerdto.IsPreferredCategoryLadies;
        Birthdate = playerdto.Birthdate;
    }
    public Player() 
    {
    }
    public override bool Equals(object? obj)
    {
        if (obj is Player otherPlayer)
        {
            return Id == otherPlayer.Id;
        }
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
    public override string ToString()
    {
        return $"Player: {Id}, Name: {Name} {LastName}, Handicap: {HandicapIndex}";
    }
    public static async Task<IResult> GetAllPlayers(BgContext db)
    {
        return Results.Ok(await db.Players.Select(x => new PlayerListGetDTO(x)).ToArrayAsync());
    }
    public static async Task<IResult> GetPlayer(int id, BgContext db)
    {
        var player = await db.Players.FindAsync(id);
        if (player == null) { return Results.NotFound(); }
        return Results.Ok(new SinglePLayerDTO(player));
    }
    public static async Task<IResult> CreatePlayer(BgContext db, PLayerPostDTO playerdto)
    {
        var existingPlayer = await db.Players.FirstOrDefaultAsync(x=> x.MatriculaAUG == playerdto.MatriculaAUG);
        if (existingPlayer != null)
        {
            return Results.BadRequest("Ya existe un jugador con la misma MatriculaAUG");
        }
        var player = new Player(playerdto);
        db.Players.Add(player);
        await db.SaveChangesAsync();
        return Results.Created($"/Players/{player.Id}", new SinglePLayerDTO(player));
    }
    public static async Task<IResult> UpdatePlayer(int id, BgContext db, PLayerPostDTO InputPlayer)
    {
        var player = await db.Players.FindAsync(id);
        if (player == null) { return Results.NotFound(); }

        player.MatriculaAUG = InputPlayer.MatriculaAUG;
        player.Name = InputPlayer.Name;
        player.LastName = InputPlayer.LastName;
        player.HandicapIndex = InputPlayer.HandicapIndex;
        player.Birthdate = InputPlayer.Birthdate;
        player.IsPreferredCategoryLadies = InputPlayer.IsPreferredCategoryLadies;

        await db.SaveChangesAsync();
        return Results.NoContent();

    }
    public static async Task<IResult> DeletePlayer(int id, BgContext db)
    {
        var player = await db.Players.FindAsync(id);
        if (player == null) { return Results.NotFound(); }

        db.Players.Remove(player);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    ///Function that return tournaments in which player participates
    public static async Task<IResult> GetPlayerTournaments(int Id, BgContext db)
    {
        var player = await db.Players.Include(p => p.Tournaments).FirstOrDefaultAsync(item => item.Id == Id);
        if (player == null) { return Results.NotFound(); }

        var dtosList = new List<TournamentListGetDTO>();
        foreach (var tournament in player.Tournaments)
        {
            dtosList.Add(new TournamentListGetDTO(tournament));
        }
        return Results.Ok(dtosList);
    }

    internal int CalculateAge()
    {
        var today = DateTime.Today;

        var a = (today.Year * 100 + today.Month) * 100 + today.Day;
        var b = (Birthdate.Year * 100 + Birthdate.Month) * 100 + Birthdate.Day;

        return (a - b) / 10000;
    }
    public void AssignCategory(Tournament tournament)
    {
        string preferredCategory = IsPreferredCategoryLadies ? "ladies" : "open";
        int age = CalculateAge();
        foreach (Category category in tournament.Categories)
        {
            if (
                category.Sex == preferredCategory || category.Sex == "mixed" &&
                category.MinAge < age &&
                category.MaxAge >= age &&
                category.MinHcap < HandicapIndex &&
                category.MaxHcap >= HandicapIndex
                )
            {
                category.Players ??= new List<Player>();
                category.Players.Add(this);
                category.Count = category.Players.Count;
            }
        }
    }
    public void AssignScorecard(Category category, Course defaultCourse, BgContext db)
    {
        string preferredCategory = IsPreferredCategoryLadies ? "ladies" : "open";
        if (!(category.Sex == preferredCategory || category.Sex == "mixed"))
            return;
        // Selecciona el curso preferido o el curso mixto si el preferido no está disponible
        // Si ambos son nulos, utiliza un curso predeterminado
        Course selectedCourse = IsPreferredCategoryLadies
            ? category.LadiesCourse ?? category.OpenCourse ?? defaultCourse
            : category.OpenCourse ?? defaultCourse;

        // Asegúrate de que hay un curso seleccionado antes de proceder
        if (selectedCourse == null)
            throw new InvalidOperationException("No se puede asignar una scorecard sin un curso definido");

        // Crear la Scorecard con los datos del curso seleccionado
        Scorecard playerScorecard = new Scorecard
        {
            PlayingHandicap = GolfMath.CalculateCourseHandicap(this, selectedCourse),
            Player = this,
            ScorecardResults = new List<ScorecardResult>()
        };
        foreach (Hole hole in selectedCourse.Holes)
        {
            playerScorecard.ScorecardResults.Add(new ScorecardResult 
            { Hole = hole,
              Scorecard = playerScorecard,
            });
        }
        if (category.Tournament != null)
        {
            category.Tournament.Scorecards.Add(playerScorecard);
        }
        Scorecards.Add(playerScorecard);
    }
}
