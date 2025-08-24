using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Api.Data;
using Api.Models.DTOs.ScorecardDTOs;
using Api.Models.Engine;

namespace Api.Models
{
    public class Result
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public int PlayerId { get; set; }
        public int Score { get; set; }
        public int TotalStrokes { get; set; }
        public string? TournamentType { get; set; }
    }
}
