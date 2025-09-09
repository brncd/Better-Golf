namespace Api.Models.Engine;

public static class GolfMath
{
    public static double CalculateCourseHandicap(Player player, Course course)
    {
        return player.HandicapIndex * (course.CourseSlope / 113.0) + (course.CourseRating - course.Par);
    }

    public static int CalculatePlayingHandicap(double courseHandicap, double handicapAllowance)
    {
        return (int)Math.Round(courseHandicap * handicapAllowance);
    }
}