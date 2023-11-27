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
    }
}
