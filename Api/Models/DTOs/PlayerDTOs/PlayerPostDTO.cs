namespace Api.Models.DTOs.PlayerDTOs;

public class PlayerPostDTO
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public double Handicap { get; set; }
    public string Gender { get; set; } = null!;
    public string DateOfBirth { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string MembershipNumber { get; set; } = null!;
}