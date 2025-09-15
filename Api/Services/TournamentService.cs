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
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class TournamentService
    {
        private readonly BgContext _db;
        private readonly CourseService _courseService;
        private readonly ResultService _resultService; // Added
        private readonly ILogger<TournamentService> _logger;

        public TournamentService(BgContext db, CourseService courseService, ResultService resultService, ILogger<TournamentService> logger) // Added resultService
        {
            _db = db;
            _courseService = courseService;
            _resultService = resultService; // Added
            _logger = logger;
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
            try
            {
                // Parse dates from string
                if (!DateOnly.TryParse(tournamentDto.StartDate, out var startDate))
                {
                    throw new ArgumentException("Invalid start date format");
                }
                
                if (!DateOnly.TryParse(tournamentDto.EndDate, out var endDate))
                {
                    throw new ArgumentException("Invalid end date format");
                }

                // Validate dates
                if (endDate <= startDate)
                {
                    throw new ArgumentException("End date must be after start date");
                }
                
                if (startDate < DateOnly.FromDateTime(DateTime.Today))
                {
                    throw new ArgumentException("Start date cannot be in the past");
                }

                // Parse tournament type
                if (!Enum.TryParse<TournamentType>(tournamentDto.TournamentType, out var tournamentType))
                {
                    throw new ArgumentException("Invalid tournament type");
                }

                // Create RoundInfo from DTO or use defaults
                RoundInfo roundInfo;
                if (tournamentDto.RoundInfo != null)
                {
                    // Parse times from string format (HH:mm)
                    if (!TimeOnly.TryParse(tournamentDto.RoundInfo.StartTime, out var startTime))
                    {
                        throw new ArgumentException("Invalid start time format");
                    }
                    
                    if (!TimeOnly.TryParse(tournamentDto.RoundInfo.EndTime, out var endTime))
                    {
                        throw new ArgumentException("Invalid end time format");
                    }

                    roundInfo = new RoundInfo(
                        interval: tournamentDto.RoundInfo.IntervalMinutes,
                        firstRoundTime: startTime.Hour * 60 + startTime.Minute, // Convert to minutes from midnight
                        endTime: endTime.Hour * 60 + endTime.Minute,
                        maxPlayersPerGroup: tournamentDto.RoundInfo.MaxPlayersPerGroup,
                        isShotgun: false
                    );
                }
                else
                {
                    // Use default values
                    roundInfo = new RoundInfo(
                        interval: 10,           // Default 10 minutes between tee times
                        firstRoundTime: 480,    // Default 8:00 AM (480 minutes from midnight)
                        endTime: 960,           // Default 4:00 PM (960 minutes from midnight)
                        maxPlayersPerGroup: 4,  // Default 4 players per group
                        isShotgun: false        // Default no shotgun start
                    );
                }
                
                _db.RoundInfos.Add(roundInfo);
                await _db.SaveChangesAsync();

                var tournament = new Tournament
                {
                    Name = tournamentDto.Name,
                    Description = tournamentDto.Description ?? string.Empty,
                    TournamentType = tournamentType,
                    StartDate = startDate,
                    EndDate = endDate,
                    HandicapAllowance = tournamentDto.HandicapAllowance ?? 1.0,
                    Status = TournamentStatus.Draft,
                    RoundInfo = roundInfo
                };
                
                _db.Tournaments.Add(tournament);
                await _db.SaveChangesAsync();
                _logger.LogInformation($"Tournament {tournament.Id} '{tournament.Name}' created successfully.");
                return new SingleTournamentDTO(tournament);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating tournament: {ex.Message}");
                throw;
            }
        }

        public async Task<Result<bool>> UpdateTournamentAsync(int id, TournamentPostDTO tournamentDto)
        {
            try
            {
                var existingTournament = await _db.Tournaments.FindAsync(id);
                if (existingTournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

                // Parse dates from string
                if (!DateOnly.TryParse(tournamentDto.StartDate, out var startDate))
                {
                    return Result<bool>.Failure(new Error("InvalidStartDate", "Invalid start date format"));
                }
                
                if (!DateOnly.TryParse(tournamentDto.EndDate, out var endDate))
                {
                    return Result<bool>.Failure(new Error("InvalidEndDate", "Invalid end date format"));
                }

                if (endDate <= startDate)
                {
                    return Result<bool>.Failure(new Error("InvalidDates", "End date must be after start date"));
                }

                // Parse tournament type
                if (!Enum.TryParse<TournamentType>(tournamentDto.TournamentType, out var tournamentType))
                {
                    return Result<bool>.Failure(new Error("InvalidTournamentType", "Invalid tournament type"));
                }

                existingTournament.Name = tournamentDto.Name;
                existingTournament.TournamentType = tournamentType;
                existingTournament.StartDate = startDate;
                existingTournament.EndDate = endDate;
                existingTournament.Description = tournamentDto.Description ?? string.Empty;
                existingTournament.HandicapAllowance = tournamentDto.HandicapAllowance ?? 1.0;

                if (tournamentDto.RoundInfo != null && existingTournament.RoundInfo != null)
                {
                    if (TimeOnly.TryParse(tournamentDto.RoundInfo.StartTime, out var startTime))
                    {
                        existingTournament.RoundInfo.FirstRoundTime = startTime.Hour * 60 + startTime.Minute;
                    }
                    if (TimeOnly.TryParse(tournamentDto.RoundInfo.EndTime, out var endTime))
                    {
                        existingTournament.RoundInfo.EndTime = endTime.Hour * 60 + endTime.Minute;
                    }
                    existingTournament.RoundInfo.Interval = tournamentDto.RoundInfo.IntervalMinutes;
                    existingTournament.RoundInfo.MaxPlayersPerGroup = tournamentDto.RoundInfo.MaxPlayersPerGroup;
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation($"Tournament {id} updated.");
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating tournament {id}: {ex.Message}");
                return Result<bool>.Failure(new Error("UpdateFailed", "Failed to update tournament"));
            }
        }

        public async Task<Result<bool>> SetTournamentStatusAsync(int id, TournamentStatus newStatus)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Categories)
                .Include(t => t.Scorecards)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            // Add business logic based on status transition
            switch (newStatus)
            {
                case TournamentStatus.OpenRegistration:
                    if (tournament.StartDate <= DateOnly.FromDateTime(DateTime.Now))
                    {
                        return Result<bool>.Failure(new Error("InvalidTransition", "Cannot open registration for a tournament that has already started or is in the past."));
                    }
                    if (!tournament.Categories.Any())
                    {
                        return Result<bool>.Failure(new Error("InvalidTransition", "Cannot open registration without at least one category."));
                    }
                    // You might add a check here to ensure categories have courses assigned
                    break;

                case TournamentStatus.InProgress:
                    if (tournament.Status != TournamentStatus.OpenRegistration)
                    {
                        return Result<bool>.Failure(new Error("InvalidTransition", "Tournament must be open for registration before it can be in progress."));
                    }
                    break;

                case TournamentStatus.Completed:
                    if (tournament.Status != TournamentStatus.InProgress)
                    {
                        return Result<bool>.Failure(new Error("InvalidTransition", "Tournament must be in progress before it can be completed."));
                    }
                    // Lock all associated scorecards
                    foreach (var scorecard in tournament.Scorecards)
                    {
                        scorecard.IsLocked = true;
                    }
                    _logger.LogInformation($"Locked all {tournament.Scorecards.Count} scorecards for completed tournament {id}.");
                    break;
            }

            tournament.Status = newStatus;
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Tournament {id} status changed to {newStatus}.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteTournamentAsync(int id)
        {
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            _db.Tournaments.Remove(tournament);
            await _db.SaveChangesAsync();
            _logger.LogInformation($"Tournament {id} deleted.");
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

        public async Task<Result<SinglePlayerDTO>> AddPlayerToTournamentAsync(int tournamentId, int playerId)
        {
            var tournament = await _db.Tournaments
                .Include(t => t.Players)
                .Include(t => t.Categories)
                .ThenInclude(c => c.Players)
                .Include(t => t.Scorecards)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null) return Result<SinglePlayerDTO>.Failure(new Error("TournamentNotFound", "Tournament not found."));

            // Check if tournament is in OpenRegistration status
            if (tournament.Status != TournamentStatus.OpenRegistration)
            {
                return Result<SinglePlayerDTO>.Failure(new Error("TournamentNotOpenForRegistration", "Tournament is not open for registration."));
            }

            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return Result<SinglePlayerDTO>.Failure(new Error("PlayerNotFound", "Player not found."));

            if (tournament.Players.Any(p => p.Id == playerId))
            {
                return Result<SinglePlayerDTO>.Failure(new Error("PlayerAlreadyInTournament", "Player is already in the tournament."));
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
                foreach (var category in tournament.Categories.Where(c => c.Players != null && c.Players.Any(p => p.Id == player.Id)))
                {
                    var assignResult = AssignScorecardToPlayer(player, category, defaultCourse, tournament);
                    if (!assignResult.IsSuccess)
                    {
                        await transaction.RollbackAsync();
                        return Result<SinglePlayerDTO>.Failure(assignResult.Error ?? new Error("UnknownError", "An unknown error occurred during scorecard assignment."));
                    }
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation($"Player {playerId} added to tournament {tournamentId}.");
                return Result<SinglePlayerDTO>.Success(new SinglePlayerDTO(player));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error adding player {playerId} to tournament {tournamentId}.");
                return Result<SinglePlayerDTO>.Failure(new Error("UnknownError", "An error occurred while adding the player to the tournament."));
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
            _logger.LogInformation($"Player {playerId} removed from tournament {tournamentId}.");
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

        public async Task<Result<SinglePlayerDTO>> RegisterCurrentUserToTournamentAsync(int tournamentId, string userId)
        {
            var player = await _db.Players.FirstOrDefaultAsync(p => p.ApplicationUserId == userId);
            if (player == null)
            {
                return Result<SinglePlayerDTO>.Failure(new Error("PlayerProfileNotFound", "A player profile for the current user does not exist."));
            }

            return await AddPlayerToTournamentAsync(tournamentId, player.Id);
        }

        private Result<bool> AssignScorecardToPlayer(Player player, Category category, Course defaultCourse, Tournament tournament)
        {
            Course selectedCourse = player.IsPreferredCategoryLadies
                ? category.LadiesCourse ?? category.OpenCourse ?? defaultCourse
                : category.OpenCourse ?? category.LadiesCourse ?? defaultCourse;

            if (selectedCourse == null) return Result<bool>.Failure(new Error("CourseNotAssigned", "Cannot assign scorecard without a defined course."));

            var courseHandicap = GolfMath.CalculateCourseHandicap(player, selectedCourse);
            var playingHandicap = GolfMath.CalculatePlayingHandicap(courseHandicap, tournament.HandicapAllowance);

            var playerScorecard = new Scorecard
            {
                PlayingHandicap = playingHandicap,
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
            var tournaments = await _db.Tournaments.Where(x => x.Status == TournamentStatus.InProgress || x.Status == TournamentStatus.OpenRegistration).ToListAsync();
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

        public async Task<Result<bool>> GenerateScorecardsForTournamentAsync(int tournamentId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var tournament = await _db.Tournaments
                    .Include(t => t.Categories)
                        .ThenInclude(c => c.Players)
                    .Include(t => t.Categories)
                        .ThenInclude(c => c.OpenCourse!)
                            .ThenInclude(c => c.Holes)
                    .Include(t => t.Categories)
                        .ThenInclude(c => c.LadiesCourse!)
                            .ThenInclude(c => c.Holes)
                    .Include(t => t.Scorecards)
                    .FirstOrDefaultAsync(t => t.Id == tournamentId);

                if (tournament == null)
                {
                    return Result<bool>.Failure(new Error("TournamentNotFound", "Tournament not found."));
                }

                if (tournament.Status != TournamentStatus.OpenRegistration)
                {
                    return Result<bool>.Failure(new Error("InvalidTournamentStatus", "Scorecards can only be generated for tournaments in OpenRegistration status."));
                }

                // Get all registered players for this tournament
                var registeredPlayers = tournament.Categories
                    .Where(c => c.Players != null)
                    .SelectMany(c => c.Players!)
                    .Distinct()
                    .ToList();

                if (!registeredPlayers.Any())
                {
                    return Result<bool>.Failure(new Error("NoPlayersRegistered", "No players are registered for this tournament."));
                }

                var defaultCourse = await _courseService.GetDefaultCourse();
                if (defaultCourse == null)
                {
                    return Result<bool>.Failure(new Error("DefaultCourseNotFound", "Default course not found."));
                }

                // Generate scorecards for each registered player
                foreach (var player in registeredPlayers)
                {
                    // Skip if player already has a scorecard for this tournament
                    if (tournament.Scorecards.Any(s => s.PlayerId == player.Id))
                    {
                        _logger.LogInformation($"Player {player.Id} already has a scorecard for tournament {tournamentId}");
                        continue;
                    }

                    // Find the categories this player is registered in for this tournament
                    var playerCategories = tournament.Categories.Where(c => c.Players != null && c.Players.Any(p => p.Id == player.Id));

                    foreach (var category in playerCategories)
                    {
                        var assignResult = AssignScorecardToPlayer(player, category, defaultCourse, tournament);
                        if (!assignResult.IsSuccess)
                        {
                            await transaction.RollbackAsync();
                            return Result<bool>.Failure(assignResult.Error ?? new Error("UnknownError", "An unknown error occurred during scorecard assignment."));
                        }
                    }
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Successfully generated scorecards for {registeredPlayers.Count} players in tournament {tournamentId}");
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error generating scorecards for tournament {tournamentId}");
                return Result<bool>.Failure(new Error("ScorecardGenerationFailed", "Failed to generate scorecards for tournament."));
            }
        }
    }
}