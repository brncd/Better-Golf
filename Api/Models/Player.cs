using Api.Models.DTOs.PlayerDTOs;
using Microsoft.AspNetCore.Identity;

namespace Api.Models;

public class Player
{
    public int Id { get; set; }
    public int MatriculaAUG { get; set; }
    public string Name { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public double HandicapIndex { get; set; }
    public DateOnly Birthdate { get; set; }
    public bool IsPreferredCategoryLadies { get; set; }
    public List<Tournament> Tournaments { get; set; } = new List<Tournament>();
    public List<Category> Categories { get; set; } = new List<Category>();
    public List<Scorecard> Scorecards { get; set; } = new List<Scorecard>();
    public ICollection<PlayerRound> PlayerRounds { get; set; } = new List<PlayerRound>(); // Added PlayerRounds collection
    public string? ApplicationUserId { get; set; }
    public virtual Microsoft.AspNetCore.Identity.IdentityUser? ApplicationUser { get; set; }

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
    public Player(PlayerPostDTO playerdto)
    {
        Name = playerdto.FirstName;
        LastName = playerdto.LastName;
        Email = playerdto.Email;
        PhoneNumber = playerdto.PhoneNumber;
        HandicapIndex = playerdto.Handicap;
        IsPreferredCategoryLadies = playerdto.Gender.ToLower() == "female";
        Birthdate = DateOnly.Parse(playerdto.DateOfBirth);
        MatriculaAUG = int.Parse(playerdto.MembershipNumber);
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

    public int CalculateAge()
    {
        var today = DateTime.Today;

        var a = (today.Year * 100 + today.Month) * 100 + today.Day;
        var b = (Birthdate.Year * 100 + Birthdate.Month) * 100 + Birthdate.Day;

        return (a - b) / 10000;
    }
}