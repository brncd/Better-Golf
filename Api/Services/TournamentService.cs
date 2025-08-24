using Api.Data;
using Api.Models;
using Api.Models.DTOs.CategoryDTOs;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs;
using Api.Models.Engine;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class TournamentService
    {
        private readonly BgContext _db;
        private readonly CourseService _courseService;
        private readonly ResultService _resultService; // Added

        public TournamentService(BgContext db, CourseService courseService, ResultService resultService) // Added resultService
        {
            _db = db;
            _courseService = courseService;
            _resultService = resultService; // Added
        }

        public async Task<List<TournamentListGetDTO>> GetAllTournamentsAsync()
        {
            return await _db.Tournaments.Select(t => new TournamentListGetDTO(t)).ToListAsync();
        }

        public async Task<SingleTournamentDTO?> GetTournamentByIdAsync(int id)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.RoundInfo)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            return tournament == null ? null : new SingleTournamentDTO(tournament);
        }

        public async Task<SingleTournamentDTO> CreateTournamentAsync(TournamentPostDTO tournamentDto)
        {
            var tournament = new Tournament(tournamentDto);
            
            // Logic from Category.GetDefaultCategory moved here
            var defaultCourse = _courseService.GetDefaultCourse();
            var defaultCategory = new Category
            {
                Name = "Mixed General Category Hcap cutoff @56",
                Sex = "mixed",
                OpenCourse = defaultCourse,
                LadiesCourse = null,
                Tournament = tournament,
                MinAge = 0,
                MaxAge = 130,
                MinHcap = -15,
                MaxHcap = 56,
            };

            tournament.Categories.Add(defaultCategory);
            
            _db.Tournaments.Add(tournament);
            await _db.SaveChangesAsync();
            
            return new SingleTournamentDTO(tournament);
        }

        public async Task<bool> UpdateTournamentAsync(int id, TournamentPostDTO tournamentDto)
        {
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return false;

            tournament.Name = tournamentDto.Name;
            tournament.Description = tournamentDto.Description;
            tournament.TournamentType = tournamentDto.TournamentType;
            tournament.StartDate = tournamentDto.StartDate;
            tournament.EndDate = tournamentDto.EndDate;
            tournament.RoundInfo = tournamentDto.RoundInfo;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTournamentAsync(int id)
        {
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return false;

            _db.Tournaments.Remove(tournament);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<PlayerListGetDTO>> GetTournamentPlayersAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return new List<PlayerListGetDTO>();

            return tournament.Players.Select(p => new PlayerListGetDTO(p)).ToList();
        }

        public async Task<List<CategoryListGetDTO>> GetTournamentCategoriesAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Categories)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return new List<CategoryListGetDTO>();

            return tournament.Categories.Select(c => new CategoryListGetDTO(c)).ToList();
        }

        public async Task<(SinglePLayerDTO?, string?)> AddPlayerToTournamentAsync(int tournamentId, int playerId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .Include(t => t.Categories)
                .ThenInclude(c => c.Players)
                .Include(t => t.Scorecards)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return (null, "Tournament not found.");

            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return (null, "Player not found.");

            if (tournament.Players.Any(p => p.Id == playerId))
            {
                return (null, "Player is already in the tournament.");
            }

            // --- Start of Transactional Logic ---
            tournament.Players.Add(player);
            tournament.Count = tournament.Players.Count;

            // Assign Category
            AssignPlayerToCategories(player, tournament);
            
            // Assign Scorecard for each category the player was assigned to
            var defaultCourse = _courseService.GetDefaultCourse();
            foreach (var category in tournament.Categories.Where(c => c.Players.Any(p => p.Id == player.Id)))
            {
                AssignScorecardToPlayer(player, category, defaultCourse, tournament);
            }

            await _db.SaveChangesAsync();
            // --- End of Transactional Logic ---

            return (new SinglePLayerDTO(player), null);
        }
        
        public async Task<bool> RemovePlayerFromTournamentAsync(int tournamentId, int playerId)
        {
            var tournament = await _db.Tournaments.Include(t => t.Players).FirstOrDefaultAsync(t => t.Id == tournamentId);
            if (tournament == null) return false;

            var player = tournament.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null) return false;

            tournament.Players.Remove(player);
            tournament.Count = tournament.Players.Count;
            // Note: This doesn't automatically remove them from categories or delete scorecards, which might be desired.
            // This logic should be expanded based on business rules.
            await _db.SaveChangesAsync();
            return true;
        }

        // Private helper methods to encapsulate logic
        private void AssignPlayerToCategories(Player player, Tournament tournament)
        {
            string preferredSex = player.IsPreferredCategoryLadies ? "ladies" : "open";
            int age = player.CalculateAge();

            foreach (var category in tournament.Categories)
            {
                bool sexMatch = category.Sex == "mixed" || category.Sex == preferredSex;
                bool ageMatch = category.MinAge <= age && category.MaxAge >= age;
                bool hcapMatch = category.MinHcap <= player.HandicapIndex && category.MaxHcap >= player.HandicapIndex;

                if (sexMatch && ageMatch && hcapMatch)
                {
                    category.Players ??= new List<Player>();
                    if (!category.Players.Any(p => p.Id == player.Id))
                    {
                        category.Players.Add(player);
                        category.Count = category.Players.Count;
                    }
                }
            }
        }

        private void AssignScorecardToPlayer(Player player, Category category, Course defaultCourse, Tournament tournament)
        {
            Course selectedCourse = player.IsPreferredCategoryLadies
                ? category.LadiesCourse ?? category.OpenCourse ?? defaultCourse
                : category.OpenCourse ?? category.LadiesCourse ?? defaultCourse;

            if (selectedCourse == null) throw new InvalidOperationException("Cannot assign scorecard without a defined course.");

            var playerScorecard = new Scorecard
            {
                PlayingHandicap = GolfMath.CalculateCourseHandicap(player, selectedCourse),
                PlayerId = player.Id,
                TournamentId = tournament.Id,
                ScorecardResults = new List<ScorecardResult>()
            };

            foreach (var hole in selectedCourse.Holes)
            {
                playerScorecard.ScorecardResults.Add(new ScorecardResult { Hole = hole });
            }
            
            tournament.Scorecards.Add(playerScorecard);
        }

        public async Task<(SingleCategoryDTO?, string?)> AddCategoryToTournamentAsync(int tournamentId, int categoryId)
        {
            var tournament = await _db.Tournaments.Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id == tournamentId);
            if (tournament == null) return (null, "Tournament not found.");

            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return (null, "Category not found.");

            if (!tournament.Categories.Any(c => c.Id == categoryId))
            {
                tournament.Categories.Add(category);
                await _db.SaveChangesAsync();
                return (new SingleCategoryDTO(category), null);
            }
            return (null, "Category already added to tournament.");
        }

        public async Task<bool> RemoveCategoryFromTournamentAsync(int tournamentId, int categoryId)
        {
            var tournament = await _db.Tournaments.Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id == tournamentId);
            if (tournament == null) return false;

            var categoryOfTournament = tournament.Categories.FirstOrDefault(c => c.Id == categoryId);
            if (categoryOfTournament != null)
            {
                tournament.Categories.Remove(categoryOfTournament);
                await _db.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<ScorecardListGetDTO>> GetTournamentScorecardsAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments.Include(x => x.Scorecards).FirstOrDefaultAsync(x => x.Id == tournamentId);
            if (tournament == null) return new List<ScorecardListGetDTO>();

            var scorecardDtos = tournament.Scorecards.Select(sc => new ScorecardListGetDTO(sc)).ToList();

            return scorecardDtos;
        }

        public async Task<List<TournamentListGetDTO>> GetActiveTournamentsAsync()
        {
            var tournaments = await _db.Tournaments.Where(x => x.StartDate < DateOnly.FromDateTime(DateTime.Now) && x.EndDate > DateOnly.FromDateTime(DateTime.Now)).ToListAsync();
            return tournaments.Select(t => new TournamentListGetDTO(t)).ToList();
        }

        public async Task<List<TournamentListGetDTO>> GetCompletedTournamentsAsync()
        {
            var tournaments = await _db.Tournaments.Where(x => x.EndDate < DateOnly.FromDateTime(DateTime.Now)).ToListAsync();
            return tournaments.Select(t => new TournamentListGetDTO(t)).ToList();
        }

        public async Task<List<TournamentRankingDTO>> CalculateTournamentResultsAsync(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Scorecards)
                    .ThenInclude(sc => sc.Player)
                .Include(t => t.Scorecards)
                    .ThenInclude(sc => sc.ScorecardResults)
                        .ThenInclude(sr => sr.Hole)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return new List<TournamentRankingDTO>();

            var playerScores = new Dictionary<int, double>();

            foreach (var scorecard in tournament.Scorecards)
            {
                double score = 0;
                if (tournament.TournamentType == "MedalPlay") // Assuming "MedalPlay" for MedalScratchScore
                {
                    score = ResultsEngine.MedalScratchScore(scorecard);
                }
                else if (tournament.TournamentType == "Stableford") // Assuming "Stableford" for StablefordScore
                {
                    score = ResultsEngine.StablefordScore(scorecard);
                }
                // Add other tournament types as needed

                if (playerScores.ContainsKey(scorecard.PlayerId))
                {
                    playerScores[scorecard.PlayerId] += score;
                }
                else
                {
                    playerScores.Add(scorecard.PlayerId, score);
                }
            }

            // Convert to TournamentRankingDTOs and sort
            var rankings = playerScores.Select(ps => new TournamentRankingDTO
            {
                TournamentId = tournamentId,
                PlayerId = ps.Key,
                TotalStrokes = (int)ps.Value // Assuming TotalStrokes can be a double or needs rounding
            })
            .OrderBy(r => r.TotalStrokes) // Order by score for MedalPlay, Stableford might be descending
            .ToList();

            // Update TournamentRankings table via ResultService
            await _resultService.GenerateTournamentRankingAsync(tournamentId);

            return rankings;
        }
    }
}
