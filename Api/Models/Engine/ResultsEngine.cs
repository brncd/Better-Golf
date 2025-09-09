using Api.Models.Enums;

namespace Api.Models.Engine

{
    public static class ResultsEngine
    {
        public static int MedalScratchScore(int playingHandicap, List<ScorecardResult> scorecardResults)
        {
            int totalStrokes = scorecardResults.Sum(x => x.Strokes);
            return (totalStrokes - playingHandicap) >= 0 ? totalStrokes - playingHandicap : 0;
        }

        public static int StablefordScore (List<ScorecardResult> scorecardResults)
        {
            int Points = 0;
            foreach (var result in scorecardResults)
            {
                if (result.Hole != null)
                {
                    int difference = result.Hole.Par - result.Strokes;

                    if (difference >= -1)
                        Points += difference + 2;
                }
            }
            return Points >= 0 ? Points : 0;
        }

        public static Match UpdateMatchState(Match match, ICollection<MatchHoleResult> holeResults, int totalHoles = 18)
        {
            int player1HolesWon = holeResults.Count(hr => hr.WinningPlayerId == match.Player1Id);
            int player2HolesWon = holeResults.Count(hr => hr.WinningPlayerId == match.Player2Id);

            int holesPlayed = holeResults.Count;
            int holesRemaining = totalHoles - holesPlayed;

            int scoreDifference = player1HolesWon - player2HolesWon;

            // Check for match completion
            if (Math.Abs(scoreDifference) > holesRemaining)
            {
                match.Status = MatchStatus.Completed;
                if (scoreDifference > 0)
                {
                    match.WinningPlayerId = match.Player1Id;
                    match.Result = $"{scoreDifference} & {holesRemaining}";
                }
                else
                {
                    match.WinningPlayerId = match.Player2Id;
                    match.Result = $"{-scoreDifference} & {holesRemaining}";
                }
            }
            else if (holesRemaining == 0)
            {
                match.Status = MatchStatus.Completed;
                if (scoreDifference > 0)
                {
                    match.WinningPlayerId = match.Player1Id;
                    match.Result = $"{scoreDifference} UP";
                }
                else if (scoreDifference < 0)
                {
                    match.WinningPlayerId = match.Player2Id;
                    match.Result = $"{-scoreDifference} UP";
                }
                else
                {
                    match.Result = "AS"; // All Square
                }
            }
            else // Match is still in progress
            {
                match.Status = MatchStatus.InProgress;
                if (scoreDifference > 0)
                {
                    match.Result = $"{scoreDifference} UP";
                }
                else if (scoreDifference < 0)
                {
                    match.Result = $"{-scoreDifference} UP";
                }
                else
                {
                    match.Result = "AS"; // All Square
                }
            }

            match.Score = scoreDifference;
            return match;
        }
    }
}
