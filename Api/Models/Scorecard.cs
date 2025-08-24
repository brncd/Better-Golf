namespace Api.Models;

public class Scorecard
{
    public int Id { get; set; }
    public int PlayingHandicap { get; set; }
    public List<ScorecardResult> ScorecardResults { get; set; } = new List<ScorecardResult>();
    public Player? Player { get; set; }
    public int PlayerId { get; set; }
    public Tournament? Tournament { get; set; }
    public int TournamentId { get; set; }
    public int TotalStrokes { get; set; }


    public Scorecard()
    {
    }
    public Scorecard(Player player)
    {
        Player = player;
    }
    public override string ToString() 
    {
        return $"Id: {Id}, PlayingHandicap: {PlayingHandicap}";
    }
    public override bool Equals(object? obj)
    {
        if (obj is Scorecard scorecard)
            return scorecard.Id == Id ;
        return false;
    }
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}
