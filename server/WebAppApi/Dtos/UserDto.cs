namespace WebAppApi.Dtos;

public record class UserDto
{
    int Id,
    string Email,
    string Password;
    DateOnly ReleaseDate;
};
