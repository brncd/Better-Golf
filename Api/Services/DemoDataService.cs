using Api.Data;
using Api.Models;
using Api.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class DemoDataService
    {
        private readonly BgContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public DemoDataService(BgContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task SeedDemoDataAsync()
        {
            // Ensure required roles exist
            var roles = new[] { "Admin", "TournamentOrganizer", "Player" };
            foreach (var roleName in roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // Create demo user if it doesn't exist
            var demoUser = await _userManager.FindByNameAsync("demo");
            if (demoUser == null)
            {
                demoUser = new IdentityUser
                {
                    UserName = "demo",
                    Email = "demo@demo.com",
                    EmailConfirmed = true
                };
                
                var result = await _userManager.CreateAsync(demoUser, "demo");
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create demo user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
                
                // Add roles to demo user (Admin includes all permissions)
                await _userManager.AddToRoleAsync(demoUser, "Admin");
                await _userManager.AddToRoleAsync(demoUser, "TournamentOrganizer");
                await _userManager.AddToRoleAsync(demoUser, "Player");
            }
            else
            {
                // Ensure demo user has Admin role
                if (!await _userManager.IsInRoleAsync(demoUser, "Admin"))
                {
                    await _userManager.AddToRoleAsync(demoUser, "Admin");
                }
            }

            // Check if demo data already exists
            var existingDemoTournament = await _context.Tournaments
                .FirstOrDefaultAsync(t => t.Name.Contains("Demo"));
            
            if (existingDemoTournament != null)
            {
                return; // Demo data already exists
            }

            // Create demo courses
            var demoCourse = new Course
            {
                Name = "Demo Golf Club",
                CourseSlope = 125,
                CourseRating = 72.5,
                Par = 72
            };

            _context.Courses.Add(demoCourse);
            await _context.SaveChangesAsync();

            // Create demo holes for the course
            var holes = new List<Hole>();
            for (int i = 1; i <= 18; i++)
            {
                holes.Add(new Hole
                {
                    Number = i,
                    Par = i <= 6 ? 4 : (i <= 12 ? 3 : (i <= 16 ? 4 : 5)),
                    StrokeIndex = i
                });
            }

            _context.Holes.AddRange(holes);
            await _context.SaveChangesAsync();

            // Create demo players
            var demoPlayers = new List<Player>
            {
                new Player(101, "Carlos", "Rodriguez", 12.5f, false)
                {
                    Email = "carlos@demo.com",
                    Birthdate = DateOnly.FromDateTime(DateTime.Now.AddYears(-35)),
                    PhoneNumber = "+598 99 123 456"
                },
                new Player(102, "Maria", "Gonzalez", 8.0f, true)
                {
                    Email = "maria@demo.com",
                    Birthdate = DateOnly.FromDateTime(DateTime.Now.AddYears(-30)),
                    PhoneNumber = "+598 99 234 567"
                },
                new Player(103, "Juan", "Perez", 15.2f, false)
                {
                    Email = "juan@demo.com",
                    Birthdate = DateOnly.FromDateTime(DateTime.Now.AddYears(-28)),
                    PhoneNumber = "+598 99 345 678"
                },
                new Player(104, "Ana", "Silva", 6.5f, true)
                {
                    Email = "ana@demo.com",
                    Birthdate = DateOnly.FromDateTime(DateTime.Now.AddYears(-32)),
                    PhoneNumber = "+598 99 456 789"
                },
                new Player(105, "Pedro", "Martinez", 18.0f, false)
                {
                    Email = "pedro@demo.com",
                    Birthdate = DateOnly.FromDateTime(DateTime.Now.AddYears(-45)),
                    PhoneNumber = "+598 99 567 890"
                }
            };

            _context.Players.AddRange(demoPlayers);
            await _context.SaveChangesAsync();

            // Create demo round info
            var demoRoundInfo = new RoundInfo
            {
                Interval = 10,
                FirstRoundTime = 800, // 8:00 AM
                IsShotgun = false
            };

            _context.RoundInfos.Add(demoRoundInfo);
            await _context.SaveChangesAsync();

            // Create demo tournaments
            var demoTournaments = new List<Tournament>
            {
                new Tournament
                {
                    Name = "Demo Spring Championship 2024",
                    Description = "Annual spring tournament with great prizes",
                    TournamentType = TournamentType.Stableford,
                    Status = TournamentStatus.InProgress,
                    StartDate = DateOnly.FromDateTime(DateTime.Now),
                    EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                    Count = 1,
                    RoundInfo = demoRoundInfo,
                    HandicapAllowance = 100
                },
                new Tournament
                {
                    Name = "Demo Monthly Cup",
                    Description = "Monthly tournament for all skill levels",
                    TournamentType = TournamentType.Stableford,
                    Status = TournamentStatus.OpenRegistration,
                    StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7)),
                    EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(8)),
                    Count = 1,
                    RoundInfo = demoRoundInfo,
                    HandicapAllowance = 100
                },
                new Tournament
                {
                    Name = "Demo Winter Series - Completed",
                    Description = "Completed winter tournament series",
                    TournamentType = TournamentType.Stableford,
                    Status = TournamentStatus.Completed,
                    StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-30)),
                    EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-29)),
                    Count = 1,
                    RoundInfo = demoRoundInfo,
                    HandicapAllowance = 100
                }
            };

            _context.Tournaments.AddRange(demoTournaments);
            await _context.SaveChangesAsync();

            // Add players to tournaments
            foreach (var tournament in demoTournaments)
            {
                foreach (var player in demoPlayers)
                {
                    tournament.Players.Add(player);
                }
            }

            await _context.SaveChangesAsync();

            // Create demo scorecards for the active tournament
            var activeTournament = demoTournaments.First(t => t.Status == TournamentStatus.InProgress);
            
            foreach (var player in demoPlayers.Take(3)) // Only first 3 players for demo
            {
                var scorecard = new Scorecard
                {
                    PlayerId = player.Id,
                    TournamentId = activeTournament.Id,
                    TotalStrokes = 0,
                    IsLocked = false,
                    PlayingHandicap = (int)player.HandicapIndex
                };

                _context.Scorecards.Add(scorecard);
                await _context.SaveChangesAsync();

                // Create some sample scorecard results
                var random = new Random();
                int totalStrokes = 0;

                for (int holeNum = 1; holeNum <= 9; holeNum++) // First 9 holes
                {
                    var hole = holes.First(h => h.Number == holeNum);
                    var strokes = hole.Par + random.Next(-1, 3); // Par +/- 1-2 strokes

                    totalStrokes += strokes;

                    var result = new ScorecardResult
                    {
                        ScorecardId = scorecard.Id,
                        HoleId = hole.Id,
                        Strokes = strokes
                    };

                    _context.ScorecardResults.Add(result);
                }

                // Update scorecard totals
                scorecard.TotalStrokes = totalStrokes;
                
                await _context.SaveChangesAsync();
            }
        }
    }
}
