using Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // Added
using Microsoft.AspNetCore.Identity; // Added

namespace Api.Data
{
    public class BgContext : IdentityDbContext<IdentityUser> // Changed base class
    {
        public DbSet<Player> Players { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<Hole> Holes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Scorecard> Scorecards { get; set; }
        public DbSet<ScorecardResult> ScorecardResults { get; set; }
        
        public DbSet<Course> Courses { get; set; }
        public DbSet<RoundInfo> RoundInfos { get; set; }
        public DbSet<TournamentRanking> TournamentRankings { get; set; }
        public BgContext(DbContextOptions<BgContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TournamentRanking>().HasKey(tr => new { tr.TournamentId, tr.PlayerId });
            modelBuilder.Entity<TournamentRanking>().Property(tr => tr.Position).ValueGeneratedNever();
        }
    }
}
