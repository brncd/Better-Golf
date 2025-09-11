using Api.Data;
using Api.Models;
using Api.Models.DTOs.TournamentDTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class TournamentRankingService
    {
        private readonly BgContext _context;
        private readonly ILogger<TournamentRankingService> _logger;

        public TournamentRankingService(BgContext context, ILogger<TournamentRankingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Calcula rankings usando funciones de ventana de PostgreSQL
        /// Demuestra las capacidades avanzadas vs SQLite
        /// </summary>
        public async Task<List<TournamentRankingDTO>> CalculateAdvancedRankingsAsync(int tournamentId)
        {
            // Esta consulta usa funciones de ventana que NO están disponibles en SQLite
            var rankings = await _context.Database.SqlQueryRaw<TournamentRankingDTO>(@"
                WITH player_scores AS (
                    SELECT 
                        p.""Id"" as PlayerId,
                        p.""Name"" as PlayerName,
                        p.""HandicapIndex"" as Handicap,
                        COALESCE(SUM(sr.""Strokes""), 0) as TotalStrokes,
                        COUNT(DISTINCT sr.""ScorecardId"") as RoundsPlayed,
                        AVG(sr.""Strokes""::decimal) as AverageStrokes
                    FROM ""Players"" p
                    LEFT JOIN ""Scorecards"" sc ON p.""Id"" = sc.""PlayerId""
                    LEFT JOIN ""ScorecardResults"" sr ON sc.""Id"" = sr.""ScorecardId""
                    WHERE sc.""TournamentId"" = {0}
                    GROUP BY p.""Id"", p.""Name"", p.""HandicapIndex""
                ),
                ranked_players AS (
                    SELECT 
                        PlayerId,
                        PlayerName,
                        Handicap,
                        TotalStrokes,
                        RoundsPlayed,
                        AverageStrokes,
                        -- Funciones de ventana avanzadas (NO disponibles en SQLite)
                        RANK() OVER (ORDER BY TotalStrokes ASC) as Position,
                        DENSE_RANK() OVER (ORDER BY TotalStrokes ASC) as DensePosition,
                        ROW_NUMBER() OVER (ORDER BY TotalStrokes ASC, AverageStrokes ASC) as RowNumber,
                        LAG(TotalStrokes) OVER (ORDER BY TotalStrokes ASC) as PreviousScore,
                        LEAD(TotalStrokes) OVER (ORDER BY TotalStrokes ASC) as NextScore,
                        -- Percentiles y estadísticas avanzadas
                        PERCENT_RANK() OVER (ORDER BY TotalStrokes ASC) as PercentileRank,
                        NTILE(4) OVER (ORDER BY TotalStrokes ASC) as Quartile
                    FROM player_scores
                    WHERE RoundsPlayed > 0
                )
                SELECT 
                    PlayerId,
                    PlayerName,
                    Position,
                    TotalStrokes,
                    RoundsPlayed,
                    ROUND(AverageStrokes, 2) as AverageStrokes,
                    Handicap,
                    CASE 
                        WHEN PreviousScore IS NULL THEN 0
                        ELSE TotalStrokes - PreviousScore
                    END as StrokesBehindPrevious,
                    ROUND(PercentileRank * 100, 1) as PercentileRank,
                    Quartile
                FROM ranked_players
                ORDER BY Position;
            ", tournamentId).ToListAsync();

            _logger.LogInformation($"Calculated advanced rankings for tournament {tournamentId} using PostgreSQL window functions");
            return rankings;
        }

        /// <summary>
        /// Análisis de tendencias por rondas usando funciones de ventana
        /// </summary>
        public async Task<List<PlayerTrendDTO>> GetPlayerTrendsAsync(int tournamentId, int playerId)
        {
            var trends = await _context.Database.SqlQueryRaw<PlayerTrendDTO>(@"
                WITH round_scores AS (
                    SELECT 
                        sr.""RoundNumber"",
                        SUM(sr.""Strokes"") as RoundScore,
                        COUNT(*) as HolesPlayed
                    FROM ""ScorecardResults"" sr
                    JOIN ""Scorecards"" sc ON sr.""ScorecardId"" = sc.""Id""
                    WHERE sc.""TournamentId"" = {0} AND sc.""PlayerId"" = {1}
                    GROUP BY sr.""RoundNumber""
                ),
                trend_analysis AS (
                    SELECT 
                        ""RoundNumber"",
                        RoundScore,
                        HolesPlayed,
                        -- Promedios móviles y tendencias
                        AVG(RoundScore) OVER (
                            ORDER BY ""RoundNumber"" 
                            ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
                        ) as MovingAverage,
                        RoundScore - LAG(RoundScore) OVER (ORDER BY ""RoundNumber"") as ScoreChange,
                        RANK() OVER (ORDER BY RoundScore ASC) as RoundRank
                    FROM round_scores
                )
                SELECT 
                    ""RoundNumber"",
                    RoundScore,
                    ROUND(MovingAverage, 2) as MovingAverage,
                    COALESCE(ScoreChange, 0) as ScoreChange,
                    RoundRank,
                    CASE 
                        WHEN ScoreChange > 0 THEN 'Worse'
                        WHEN ScoreChange < 0 THEN 'Better'
                        ELSE 'Same'
                    END as Trend
                FROM trend_analysis
                ORDER BY ""RoundNumber"";
            ", tournamentId, playerId).ToListAsync();

            return trends;
        }
    }

    // DTOs para las consultas avanzadas
    public class TournamentRankingDTO
    {
        public int PlayerId { get; set; }
        public string PlayerName { get; set; } = "";
        public int Position { get; set; }
        public int TotalStrokes { get; set; }
        public int RoundsPlayed { get; set; }
        public decimal AverageStrokes { get; set; }
        public decimal Handicap { get; set; }
        public int StrokesBehindPrevious { get; set; }
        public decimal PercentileRank { get; set; }
        public int Quartile { get; set; }
    }

    public class PlayerTrendDTO
    {
        public int RoundNumber { get; set; }
        public int RoundScore { get; set; }
        public decimal MovingAverage { get; set; }
        public int ScoreChange { get; set; }
        public int RoundRank { get; set; }
        public string Trend { get; set; } = "";
    }
}
