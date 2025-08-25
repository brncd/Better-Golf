
using Xunit;
using Api.Models.Engine;
using Api.Models;
using System.Collections.Generic;

namespace Api.Tests
{
    public class ResultsEngineTests
    {
        [Fact]
        public void MedalScratchScore_ShouldCalculateCorrectly()
        {
            // Arrange
            var scorecardResults = new List<ScorecardResult>
            {
                new ScorecardResult { Strokes = 4 },
                new ScorecardResult { Strokes = 5 },
                new ScorecardResult { Strokes = 3 }
            };
            int playingHandicap = 2;
            int expected = 10; // (4 + 5 + 3) - 2

            // Act
            int actual = ResultsEngine.MedalScratchScore(playingHandicap, scorecardResults);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void StablefordScore_ShouldCalculateCorrectly()
        {
            // Arrange
            var scorecardResults = new List<ScorecardResult>
            {
                new ScorecardResult { Strokes = 4, Hole = new Hole { Par = 4 } }, // 2 points
                new ScorecardResult { Strokes = 5, Hole = new Hole { Par = 4 } }, // 1 point
                new ScorecardResult { Strokes = 3, Hole = new Hole { Par = 4 } }  // 3 points
            };
            int expected = 6;

            // Act
            int actual = ResultsEngine.StablefordScore(scorecardResults);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
