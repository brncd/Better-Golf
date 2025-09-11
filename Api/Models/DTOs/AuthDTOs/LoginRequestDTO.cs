namespace Api.Models.DTOs.AuthDTOs
{
    public class LoginRequestDTO
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
