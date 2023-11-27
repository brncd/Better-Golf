namespace Api.Models.Engine;

public static class GolfMath
{

    public static int CalculateCourseHandicap(Player player, Course course) // la funcion de verdad tomaria: int numberofholes, int courseslope, double courserating, double handiapindex
    {
        return Convert.ToInt32(player.HandicapIndex * (course.CourseSlope / 113) + (course.CourseRating - course.Par));
    }
}