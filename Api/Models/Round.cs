namespace Api.Models
{
    public class Round
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public Tournament Tournament { get; set; } = null!;
        public int RoundNumber { get; set; }
        public DateOnly Date { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public int? RoundInfoId { get; set; }
        public RoundInfo? RoundInfo { get; set; }
        public ICollection<PlayerRound> PlayerRounds { get; set; } = new List<PlayerRound>();
    }
}
