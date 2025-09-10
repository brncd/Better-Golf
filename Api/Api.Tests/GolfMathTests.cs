
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
            double expected = 9.6; // 10.5 * (120 / 113.0) + (70.5 - 72)

            // Act
            double actual = GolfMath.CalculateCourseHandicap(player, course);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
