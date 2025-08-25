namespace Api.Models.Results
{
    public class Result<T>
    {
        public T? Value { get; }
        public Error? Error { get; }

        public bool IsSuccess => Error == null;

        private Result(T value)
        {
            Value = value;
            Error = null;
        }

        private Result(Error error)
        {
            Value = default;
            Error = error;
        }

        public static Result<T> Success(T value) => new(value);
        public static Result<T> Failure(Error error) => new(error);
    }

    public class Error
    {
        public string Code { get; }
        public string Description { get; }

        public Error(string code, string description)
        {
            Code = code;
            Description = description;
        }
    }
}
