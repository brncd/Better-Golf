# Better Golf API

This is a part of a web application built with .NET Core. This API is designed to manage golf tournaments, including players, tournaments, categories, courses, holes, scorecards, and results. Below is a brief overview of the API and how to use it.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Configuration](#database-configuration)
- [Getting Started](#getting-started)
- [Docker Configuration](#docker-configuration)
- [API Endpoints](#api-endpoints)
- [Swagger Documentation](#swagger-documentation)
- [CORS Configuration](#cors-configuration)

## Prerequisites

Before you start using this API, make sure you have the following prerequisites installed. If you use Docker, you don't need to install anything else.

- [.NET 7](https://dotnet.microsoft.com/download/dotnet)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker](https://www.docker.com/get-started) (optional)

## Database Configuration

The API uses PostgreSQL as the database. You can configure the database connection in the `appsettings.json` and `appsettings.Development.json` files. Update the `ConnectionStrings` section with your PostgreSQL connection details.

## Getting Started

1. Clone the repository to your local machine.

2. Open the terminal and navigate to the API project directory.

3. Run the following command to apply database migrations:
   ```shell
   dotnet ef database update
   ```
   In Docker you can run the following command to create the database and apply migrations:
   ```shell
   docker exec $CONTAINER_NAME dotnet ef database update
   ```
   This command will create the database and apply the necessary migrations.

## Docker Configuration

To run the API using Docker, you can use the provided Dockerfile and Docker Compose file.

- **Dockerfile** (from `development` stage)
  - The API Dockerfile is configured to expose port 5000, which is where the API will be running.
  - It uses the .NET SDK 7.0 as the base image and sets the working directory to `/app`.

- **Docker Compose**
  - The provided `docker-compose.yml` file defines three services: `api`, `database`, and `client`.
  - The `api` service is the .NET application using the Dockerfile from the API project and exposes port 5000.
  - The `database` service is a PostgreSQL container exposing port 5432.
  - The `client` service, view the [client README](../Client/README.md) for more information.

## API Endpoints

The API provides the following endpoints to manage golf tournaments:

- **Players**
  - GET `/api/Players`: Get a list of all players.
  - GET `/api/Players/{id}`: Get a player by ID.
  - POST `/api/Players`: Create a new player.
  - PUT `/api/Players/{id}`: Update a player.
  - DELETE `/api/Players/{id}`: Delete a player.
  - GET `/api/Players/{id}/Tournaments`: Get tournaments associated with a player.

- **Tournaments**
  - GET `/api/Tournaments`: Get a list of all tournaments.
  - GET `/api/Tournaments/{id}`: Get a tournament by ID.
  - POST `/api/Tournaments`: Create a new tournament.
  - PUT `/api/Tournaments/{id}`: Update a tournament.
  - DELETE `/api/Tournaments/{id}`: Delete a tournament.
  - POST `/api/Tournaments/{id}/Players`: Add a player to a tournament.
  - DELETE `/api/Tournaments/{id}/Players/{playerid}`: Remove a player from a tournament.
  - GET `/api/Tournaments/{id}/Players`: Get players participating in a tournament.
  - GET `/api/Tournaments/{id}/Categories`: Get categories for a tournament.
  - POST `/api/Tournaments/{id}/Categories`: Add a category to a tournament.
  - DELETE `/api/Tournaments/{id}/Categories/{categoryid}`: Remove a category from a tournament.
  - GET `/api/Tournaments/{id}/Scorecards`: Get scorecards for a tournament.

- **Categories**
  - GET `/api/Categories`: Get a list of all categories.
  - GET `/api/Categories/{id}`: Get a category by ID.
  - POST `/api/Categories`: Create a new category.
  - PUT `/api/Categories/{id}`: Update a category.
  - DELETE `/api/Categories/{id}`: Delete a category.
  - POST `/api/Categories/{id}/Players`: Add a player to a category.
  - GET `/api/Categories/{id}/Players`: Get players in a category.
  - DELETE `/api/Categories/{id}/Players/{playerid}`: Remove a player from a category.
  - POST `/api/Categories/{id}/SetOpenCourse`: Set the open course for a category.
  - POST `/api/Categories/{id}/SetLadiesCourse`: Set the ladies course for a category.

- **Courses**
  - GET `/api/Courses`: Get a list of all golf courses.
  - GET `/api/Courses/{id}`: Get a course by ID.
  - POST `/api/Courses`: Create a new golf course.
  - PUT `/api/Courses/{id}`: Update a golf course.
  - DELETE `/api/Courses/{id}`: Delete a golf course.
  - DELETE `/api/Courses/{id}/Holes/{holeid}`: Delete a hole from a golf course.
  - POST `/api/Courses/{id}/Holes`: Add a hole to a golf course.
  - GET `/api/Courses/{id}/Holes`: Get holes for a golf course.

- **ScorecardResult**
  - GET `/api/ScorecardResults/{id}`: Get a scorecard result.
  - PUT `/api/ScorecardResults/{id}`: Update a scorecard result.
  - DELETE `/api/ScorecardResults/{id}`: Delete a scorecard result.

- **Holes** (Note: Some endpoints are unfinished and commented out in the code)
  - PUT `/api/Holes/{id}`: Update a hole.

- **Scorecard** (Note: Some endpoints are unfinished and commented out in the code)
  - DELETE `/api/Scorecards/{id}`: Delete a scorecard.

- **Results** (Note: Some endpoints are unfinished and commented out in the code)

- **RoundsInfo** (Note: Some endpoints are unfinished and commented out in the code)

## Swagger Documentation

The API provides Swagger documentation to help you understand the available endpoints and how to use them. You can access the Swagger documentation at `/swagger` when the API is running.

## CORS Configuration

CORS (Cross-Origin Resource Sharing) is configured to allow requests from any origin. You can further customize CORS settings in the code if needed.

Please note that this README provides an overview of the API and its endpoints. Detailed documentation for each endpoint's request and response format should be available in the code or Swagger documentation.
