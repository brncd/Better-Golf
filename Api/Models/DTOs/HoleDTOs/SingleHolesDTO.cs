namespace Api.Models.DTOs.HoleDTOs;

public class SingleHoleDTO
{
    public int Id { get; set; }
    public int Par { get; set; }
    public int Number { get; set; }
    public int StrokeIndex { get; set; }

    public SingleHoleDTO(Hole hole)
    {
        Id = hole.Id;
        Par = hole.Par;
        Number = hole.Number;
        StrokeIndex = hole.StrokeIndex;
    }
}