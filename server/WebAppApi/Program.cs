using WebAppApi.Dtos;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<UserDto> users = [
  new (
    1,
  "kamil@123",
  "Kamil1",
  new DateOnly(2002, 7, 15))
];
// GET /users
app.MapGet("/users", () => "Siemano!");

app.MapGet("/", () => "Hello World!");

app.Run();
