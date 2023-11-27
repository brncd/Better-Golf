using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    public class BgContext : DbContext
    {
        public DbSet<Player> Players { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<Hole> Holes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Scorecard> Scorecards { get; set; }
        public DbSet<ScorecardResult> ScorecardResults { get; set; }
        public DbSet<Result> Results { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<RoundInfo> RoundInfos { get; set; }
        public DbSet<Result.TournamentRanking> TournamentRankings { get; set; }
        public BgContext(DbContextOptions<BgContext> options)
            : base(options)
        {
        }
    }
}
