
using Xunit;
using Api.Models.Engine;
using Api.Models;

namespace Api.Tests
{
    public class GolfMathTests
    {
        [Fact]
        public void CalculateCourseHandicap_ShouldCalculateCorrectly()
        {
            // Arrange
            var player = new Player { HandicapIndex = 10.5 };
            var course = new Course { CourseSlope = 120, CourseRating = 70.5, Par = 72 };
            int expected = 9; // Convert.ToInt32(10.5 * (120 / 113) + (70.5 - 72))

            // Act
            int actual = GolfMath.CalculateCourseHandicap(player, course);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
