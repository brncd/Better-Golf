using Api.Data;
using Api.Models;
using Api.Models.DTOs.CourseDTOs;
using Api.Models.DTOs.HoleDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class CourseService
    {
        private readonly BgContext _db;

        public CourseService(BgContext db)
        {
            _db = db;
        }

        public async Task<List<CoursesListGetDTO>> GetAllCoursesAsync()
        {
            return await _db.Courses.Select(c => new CoursesListGetDTO(c)).ToListAsync();
        }

        public async Task<SingleCourseDTO?> GetCourseByIdAsync(int id)
        {
            var course = await _db.Courses.FindAsync(id);
            return course == null ? null : new SingleCourseDTO(course);
        }

        public async Task<SingleCourseDTO> CreateCourseAsync(CoursePostDTO courseDto)
        {
            var course = new Course(courseDto);
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();
            return new SingleCourseDTO(course);
        }

        public async Task<bool> UpdateCourseAsync(int id, CoursePostDTO courseDto)
        {
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return false;

            course.Par = courseDto.Par;
            course.Name = courseDto.Name;
            course.CourseRating = courseDto.CourseRating;
            course.CourseSlope = courseDto.CourseSlope;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCourseAsync(int id)
        {
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return false;

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<HoleListGetDTO>> GetCourseHolesAsync(int courseId)
        {
            var course = await _db.Courses.Include(c => c.Holes).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null || course.Holes == null) return new List<HoleListGetDTO>();
            return course.Holes.Select(h => new HoleListGetDTO(h)).ToList();
        }

        public async Task<bool> AddHoleToCourseAsync(int courseId, HolePostDTO holeDto)
        {
            var course = await _db.Courses.Include(c => c.Holes).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null) return false;

            course.Holes.Add(new Hole(holeDto));
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveHoleFromCourseAsync(int courseId, int holeId)
        {
            var course = await _db.Courses.Include(c => c.Holes).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course?.Holes == null) return false;

            var hole = course.Holes.FirstOrDefault(h => h.Id == holeId);
            if (hole == null) return false;

            course.Holes.Remove(hole);
            await _db.SaveChangesAsync();
            return true;
        }

        public Course GetDefaultCourse()
        {
            var existingCourse = _db.Courses.Include(c => c.Holes).FirstOrDefault(c => c.Name == "Default Course");
            if (existingCourse != null)
            {
                return existingCourse;
            }

            var defaultCourse = new Course
            {
                Name = "Default Course",
                CourseSlope = 113,
                CourseRating = 72.0,
                Par = 72,
                Holes = GenerateDefaultHoles(18)
            };

            _db.Courses.Add(defaultCourse);
            _db.SaveChanges();

            return defaultCourse;
        }

        private static List<Hole> GenerateDefaultHoles(int numberOfHoles)
        {
            List<Hole> holes = new List<Hole>();
            for (int i = 1; i <= numberOfHoles; i++)
            {
                holes.Add(new Hole
                {
                    Par = 4,
                    Number = i
                });
            }
            return holes;
        }
    }
}
