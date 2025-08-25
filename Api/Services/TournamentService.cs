using Api.Data;
using Api.Models;
using Api.Models.DTOs.CategoryDTOs;
using Api.Models.DTOs.PlayerDTOs;
using Api.Models.DTOs.TournamentDTOs;
using Api.Models.DTOs.ScorecardDTOs; // Added
using Api.Models.DTOs.ResultDTOs; // Added
using Api.Models.Engine;
using Microsoft.EntityFrameworkCore;
using Api.Models.Enums;
using Api.Models.Results;
using Api.Models.Common;

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

        public async Task<PaginationResponse<TournamentListGetDTO>> GetAllTournamentsAsync(PaginationRequest pagination)
        {
            var query = _db.Tournaments.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(t => new TournamentListGetDTO(t))
                                   .ToListAsync();
            return new PaginationResponse<TournamentListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items);
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
            
            _db.Tournaments.Add(tournament);
            await _db.SaveChangesAsync();
            
            return new SingleTournamentDTO(tournament);
        }

        public async Task<Result<bool>> UpdateTournamentAsync(int id, TournamentPostDTO tournamentDto)
        {
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            tournament.Name = tournamentDto.Name;
            tournament.Description = tournamentDto.Description;
            tournament.TournamentType = tournamentDto.TournamentType;
            tournament.StartDate = tournamentDto.StartDate;
            tournament.EndDate = tournamentDto.EndDate;
            tournament.RoundInfo = tournamentDto.RoundInfo;

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteTournamentAsync(int id)
        {
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            _db.Tournaments.Remove(tournament);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<PaginationResponse<PlayerListGetDTO>>> GetTournamentPlayersAsync(int tournamentId, PaginationRequest pagination)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<PaginationResponse<PlayerListGetDTO>>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var query = tournament.Players.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(p => new PlayerListGetDTO(p))
                                   .ToListAsync();
            return Result<PaginationResponse<PlayerListGetDTO>>.Success(new PaginationResponse<PlayerListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items));
        }

        public async Task<Result<PaginationResponse<CategoryListGetDTO>>> GetTournamentCategoriesAsync(int tournamentId, PaginationRequest pagination)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Categories)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<PaginationResponse<CategoryListGetDTO>>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var query = tournament.Categories.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(c => new CategoryListGetDTO(c))
                                   .ToListAsync();
            return Result<PaginationResponse<CategoryListGetDTO>>.Success(new PaginationResponse<CategoryListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items));
        }

        public async Task<Result<SinglePLayerDTO>> AddPlayerToTournamentAsync(int tournamentId, int playerId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .Include(t => t.Categories)
                .ThenInclude(c => c.Players)
                .Include(t => t.Scorecards)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<SinglePLayerDTO>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return Result<SinglePLayerDTO>.Failure(new Error("PlayerNotFound", "Player not found."));

            if (tournament.Players.Any(p => p.Id == playerId))
            {
                return Result<SinglePLayerDTO>.Failure(new Error("PlayerAlreadyInTournament", "Player is already in the tournament."));
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                tournament.Players.Add(player);
                tournament.Count = tournament.Players.Count;

                // Assign Category
                AssignPlayerToCategories(player, tournament);

                // Assign Scorecard for each category the player was assigned to
                var defaultCourse = await _courseService.GetDefaultCourse();
                foreach (var category in tournament.Categories.Where(c => c.Players.Any(p => p.Id == player.Id)))
                {
                    var assignResult = AssignScorecardToPlayer(player, category, defaultCourse, tournament);
                    if (!assignResult.IsSuccess)
                    {
                        await transaction.RollbackAsync();
                        return Result<SinglePLayerDTO>.Failure(assignResult.Error);
                    }
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Result<SinglePLayerDTO>.Success(new SinglePLayerDTO(player));
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return Result<SinglePLayerDTO>.Failure(new Error("UnknownError", "An error occurred while adding the player to the tournament."));
            }
        }
        
        public async Task<Result<bool>> RemovePlayerFromTournamentAsync(int tournamentId, int playerId)
        {
            var tournament = await _db.Tournaments.Include(t => t.Players).FirstOrDefaultAsync(t => t.Id == tournamentId);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var player = tournament.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null) return Result<bool>.Failure(new Error("PlayerNotFound", "Player not found in tournament."));

            tournament.Players.Remove(player);
            tournament.Count = tournament.Players.Count;
            // Note: This doesn't automatically remove them from categories or delete scorecards, which might be desired.
            // This logic should be expanded based on business rules.
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        // Private helper methods to encapsulate logic
        private void AssignPlayerToCategories(Player player, Tournament tournament)
        {
            Gender preferredSex = player.IsPreferredCategoryLadies ? Gender.Ladies : Gender.Open;
            int age = player.CalculateAge();

            foreach (var category in tournament.Categories)
            {
                bool sexMatch = category.Sex == Gender.Mixed || category.Sex == preferredSex;
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

        private Result<bool> AssignScorecardToPlayer(Player player, Category category, Course defaultCourse, Tournament tournament)
        {
            Course selectedCourse = player.IsPreferredCategoryLadies
                ? category.LadiesCourse ?? category.OpenCourse ?? defaultCourse
                : category.OpenCourse ?? category.LadiesCourse ?? defaultCourse;

            if (selectedCourse == null) return Result<bool>.Failure(new Error("CourseNotAssigned", "Cannot assign scorecard without a defined course."));

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
            return Result<bool>.Success(true);
        }

        public async Task<Result<SingleCategoryDTO>> AddCategoryToTournamentAsync(int tournamentId, int categoryId)
        {
            var tournament = await _db.Tournaments.Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id == tournamentId);
            if (tournament == null) return Result<SingleCategoryDTO>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return Result<SingleCategoryDTO>.Failure(new Error("CategoryNotFound", "Category not found."));

            if (tournament.Categories.Any(c => c.Id == categoryId))
            {
                return Result<SingleCategoryDTO>.Failure(new Error("CategoryAlreadyInTournament", "Category already added to tournament."));
            }

            tournament.Categories.Add(category);
            await _db.SaveChangesAsync();
            return Result<SingleCategoryDTO>.Success(new SingleCategoryDTO(category));
        }

        public async Task<Result<bool>> RemoveCategoryFromTournamentAsync(int tournamentId, int categoryId)
        {
            var tournament = await _db.Tournaments.Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id == tournamentId);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            var categoryOfTournament = tournament.Categories.FirstOrDefault(c => c.Id == categoryId);
            if (categoryOfTournament == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found in tournament."));

            tournament.Categories.Remove(categoryOfTournament);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
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
            return await _resultService.GenerateTournamentRankingAsync(tournamentId);
        }
    }
}