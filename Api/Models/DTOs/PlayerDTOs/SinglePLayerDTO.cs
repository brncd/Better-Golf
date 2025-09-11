namespace Api.Models.DTOs.PlayerDTOs;

public class SinglePlayerDTO 
{
    public string Id { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public double Handicap { get; set; }
    public string Gender { get; set; } = null!;
    public string DateOfBirth { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string MembershipNumber { get; set; } = null!;
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = null!;

    public SinglePlayerDTO(Player player)
    {
        Id = player.Id.ToString();
        FirstName = player.Name;
        LastName = player.LastName;
        Email = player.Email ?? "";
        Handicap = player.HandicapIndex;
        Gender = player.IsPreferredCategoryLadies ? "female" : "male";
        DateOfBirth = player.Birthdate.ToString("yyyy-MM-dd");
        PhoneNumber = player.PhoneNumber ?? "";
        MembershipNumber = player.MatriculaAUG.ToString();
        IsActive = true;
        CreatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        // CategoryId and CategoryName will be set by service if needed
    }
}