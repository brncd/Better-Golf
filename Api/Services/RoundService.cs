
using Api.Data;
using Api.Models;
using Api.Models.DTOs.RoundDTOs;
using Api.Models.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class RoundService
    {
        private readonly BgContext _db;
        private readonly ILogger<RoundService> _logger;

        public RoundService(BgContext db, ILogger<RoundService> logger)
        {
            _db = db;
            _logger = logger;
        }

        // La lógica de generación de Tee Times se añadirá aquí
    }
}
