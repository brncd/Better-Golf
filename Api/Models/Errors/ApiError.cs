namespace Api.Models.Errors
{
    public class ApiError
    {
        public int StatusCode { get; }
        public string Message { get; }
        public string? Details { get; }

        public ApiError(int statusCode, string message, string? details = null)
        {
            StatusCode = statusCode;
            Message = message;
            Details = details;
        }
    }
}
