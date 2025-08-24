using Api.Data;
using Api.Models;
using Api.Models.DTOs.CategoryDTOs;
using Api.Models.DTOs.PlayerDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class CategoryService
    {
        private readonly BgContext _db;

        public CategoryService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<CategoryListGetDTO>> GetAllCategoriesAsync()
        {
            return await _db.Categories.Select(c => new CategoryListGetDTO(c)).ToListAsync();
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

        public async Task<bool> UpdateCategoryAsync(int id, CategoryPostDTO categoryDto)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return false;

            category.Name = categoryDto.Name;
            category.MinAge = categoryDto.MinAge;
            category.MaxAge = categoryDto.MaxAge;
            category.MinHcap = categoryDto.MinHcap;
            category.MaxHcap = categoryDto.MaxHcap;
            category.NumberOfHoles = categoryDto.NumberOfHoles;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return false;

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<PlayerListGetDTO>> GetCategoryPlayersAsync(int categoryId)
        {
            var category = await _db.Categories
                .Include(c => c.Players)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null || category.Players == null)
            {
                return new List<PlayerListGetDTO>();
            }

            return category.Players.Select(p => new PlayerListGetDTO(p)).ToList();
        }

        public async Task<(PlayerListGetDTO?, string?)> AddPlayerToCategoryAsync(int categoryId, int playerId)
        {
            var category = await _db.Categories.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category == null) return (null, "Category not found.");

            var player = await _db.Players.FindAsync(playerId);
            if (player == null) return (null, "Player not found.");

            if (category.Players != null && !category.Players.Any(p => p.Id == playerId))
            {
                category.Players.Add(player);
                category.Count = category.Players.Count;
                await _db.SaveChangesAsync();
                return (new PlayerListGetDTO(player), null);
            }
            
            return (null, "Player already in category.");
        }

        public async Task<bool> RemovePlayerFromCategoryAsync(int categoryId, int playerId)
        {
            var category = await _db.Categories.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category?.Players == null) return false;

            var player = category.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null) return false;

            category.Players.Remove(player);
            category.Count = category.Players.Count;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetOpenCourseAsync(int categoryId, int courseId)
        {
            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return false;

            var course = await _db.Courses.FindAsync(courseId);
            if (course == null) return false;

            category.OpenCourse = course;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetLadiesCourseAsync(int categoryId, int courseId)
        {
            var category = await _db.Categories.FindAsync(categoryId);
            if (category == null) return false;

            var course = await _db.Courses.FindAsync(courseId);
            if (course == null) return false;

            category.LadiesCourse = course;
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
