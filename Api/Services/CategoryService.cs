using Api.Data;
using Api.Models;
using Api.Models.DTOs.CategoryDTOs;
using Api.Models.DTOs.PlayerDTOs;
using Microsoft.EntityFrameworkCore;
using Api.Models.Results;
using Api.Models.Common;

namespace Api.Services
{
    public class CategoryService
    {
        private readonly BgContext _db;

        public CategoryService(BgContext db)
        {
            _db = db;
        }

        public async Task<PaginationResponse<CategoryListGetDTO>> GetAllCategoriesAsync(PaginationRequest pagination)
        {
            var query = _db.Categories.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(c => new CategoryListGetDTO(c))
                                   .ToListAsync();
            return new PaginationResponse<CategoryListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items);
        }

        public async Task<SingleCategoryDTO?> GetCategoryByIdAsync(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            return category == null ? null : new SingleCategoryDTO(category);
        }

        public async Task<SingleCategoryDTO> CreateCategoryAsync(CategoryPostDTO categoryDto)
        {
            var category = new Category(categoryDto);
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return new SingleCategoryDTO(category);
        }

        public async Task<Result<bool>> UpdateCategoryAsync(int id, CategoryPostDTO categoryDto)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found."));

            category.Name = categoryDto.Name;
            category.MinAge = categoryDto.MinAge;
            category.MaxAge = categoryDto.MaxAge;
            category.MinHcap = categoryDto.MinHcap;
            category.MaxHcap = categoryDto.MaxHcap;
            category.NumberOfHoles = categoryDto.NumberOfHoles;

            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found."));

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<PaginationResponse<PlayerListGetDTO>>> GetCategoryPlayersAsync(int categoryId, PaginationRequest pagination)
        {
            var category = await _db.Categories
                .Include(c => c.Players)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null) return Result<PaginationResponse<PlayerListGetDTO>>.Failure(new Error("CategoryNotFound", "Category not found."));
            if (category.Players == null) return Result<PaginationResponse<PlayerListGetDTO>>.Success(new PaginationResponse<PlayerListGetDTO>(pagination.PageNumber, pagination.PageSize, 0, new List<PlayerListGetDTO>()));

            var query = category.Players.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pagination.PageNumber - 1) * pagination.PageSize)
                                   .Take(pagination.PageSize)
                                   .Select(p => new PlayerListGetDTO(p))
                                   .ToListAsync();
            return Result<PaginationResponse<PlayerListGetDTO>>.Success(new PaginationResponse<PlayerListGetDTO>(pagination.PageNumber, pagination.PageSize, totalCount, items));
        }

        public async Task<Result<SinglePLayerDTO>> AddPlayerToCategoryAsync(int categoryId, int playerId)
        {
            var category = await _db.Categories.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category == null) return Result<SinglePLayerDTO>.Failure(new Error("CategoryNotFound", "Category not found."));

            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return Result<SinglePLayerDTO>.Failure(new Error("PlayerNotFound", "Player not found."));

            if (category.Players != null && !category.Players.Any(p => p.Id == playerId))
            {
                category.Players.Add(player);
                category.Count = category.Players.Count;
                await _db.SaveChangesAsync();
                return Result<SinglePLayerDTO>.Success(new SinglePLayerDTO(player));
            }
            
            return Result<SinglePLayerDTO>.Failure(new Error("PlayerAlreadyInCategory", "Player already in category."));
        }

        public async Task<Result<bool>> RemovePlayerFromCategoryAsync(int categoryId, int playerId)
        {
            var category = await _db.Categories.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found."));

            var player = category.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null) return Result<bool>.Failure(new Error("PlayerNotFound", "Player not found in category."));

            category.Players.Remove(player);
            category.Count = category.Players.Count;
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> SetOpenCourseAsync(int categoryId, int courseId)
        {
            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found."));

            var course = await _db.Courses.FindAsync(courseId);
            if (course == null) return Result<bool>.Failure(new Error("CourseNotFound", "Course not found."));

            category.OpenCourse = course;
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> SetLadiesCourseAsync(int categoryId, int courseId)
        {
            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return Result<bool>.Failure(new Error("CategoryNotFound", "Category not found."));

            var course = await _db.Courses.FindAsync(courseId);
            if (course == null) return Result<bool>.Failure(new Error("CourseNotFound", "Course not found."));

            category.LadiesCourse = course;
            await _db.SaveChangesAsync();
            return Result<bool>.Success(true);
        }
    }
}
