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
        public DbSet<Round> Rounds { get; set; } // Added DbSet for Round
        public DbSet<PlayerRound> PlayerRounds { get; set; } // Added DbSet for PlayerRound

        public BgContext(DbContextOptions<BgContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure TournamentRanking composite key
            modelBuilder.Entity<TournamentRanking>().HasKey(tr => new { tr.TournamentId, tr.PlayerId });
            modelBuilder.Entity<TournamentRanking>().Property(tr => tr.Position).ValueGeneratedNever();

            // Configure PlayerRound many-to-many relationship
            modelBuilder.Entity<PlayerRound>()
                .HasKey(pr => new { pr.PlayerId, pr.RoundId });

            modelBuilder.Entity<PlayerRound>()
                .HasOne(pr => pr.Player)
                .WithMany(p => p.PlayerRounds)
                .HasForeignKey(pr => pr.PlayerId);

            modelBuilder.Entity<PlayerRound>()
                .HasOne(pr => pr.Round)
                .WithMany(r => r.PlayerRounds)
                .HasForeignKey(pr => pr.RoundId);

            // Configure Tournament to Round one-to-many relationship
            modelBuilder.Entity<Round>()
                .HasOne(r => r.Tournament)
                .WithMany(t => t.Rounds)
                .HasForeignKey(r => r.TournamentId);

            // Configure Course to Round one-to-many relationship (optional Course for Round)
            modelBuilder.Entity<Round>()
                .HasOne(r => r.Course)
                .WithMany() // No navigation property in Course for Rounds
                .HasForeignKey(r => r.CourseId)
                .IsRequired(false); // Course is optional for a Round

            // Configure RoundInfo to Round one-to-many relationship (optional RoundInfo for Round)
            modelBuilder.Entity<Round>()
                .HasOne(r => r.RoundInfo)
                .WithMany() // No navigation property in RoundInfo for Rounds
                .HasForeignKey(r => r.RoundInfoId)
                .IsRequired(false); // RoundInfo is optional for a Round

            // Configure cascade deletes
            modelBuilder.Entity<Tournament>()
                .HasMany(t => t.Scorecards)
                .WithOne(sc => sc.Tournament)
                .HasForeignKey(sc => sc.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Tournament>()
                .HasMany(t => t.Categories)
                .WithOne(c => c.Tournament)
                .HasForeignKey(c => c.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Tournament>()
                .HasMany(t => t.Rounds)
                .WithOne(r => r.Tournament)
                .HasForeignKey(r => r.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Scorecard>()
                .HasMany(sc => sc.ScorecardResults)
                .WithOne(sr => sr.Scorecard)
                .HasForeignKey(sr => sr.ScorecardId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}