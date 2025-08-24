# Better Golf API

This is a part of a web application built with .NET. This API is designed to manage golf tournaments, including players, tournaments, categories, courses, holes, scorecards, and results.

## Table of Contents

- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
- [Docker Configuration (Alternative)](#docker-configuration-alternative)
- [API Endpoints](#api-endpoints)
- [Swagger Documentation](#swagger-documentation)
- [CORS Configuration](#cors-configuration)

## Local Development Setup

This is the recommended setup for running the API on your local machine for development.

### Prerequisites

- **.NET 9 SDK** (or the version specified in `Api.csproj`)
- **Visual Studio 2022** (which includes SQL Server Express LocalDB) or the standalone .NET SDK and LocalDB.

### Getting Started

1.  **Clone the repository** to your local machine.
2.  **Open a terminal** and navigate to the `Api` project directory.
3.  **Build the project** to restore dependencies:
    ```shell
    dotnet build
    ```
4.  **Create and migrate the local database**:
    This command will create a `BetterGolf.Dev` database on your LocalDB instance and create all the necessary tables.
    ```shell
    dotnet ef database update
    ```
5.  **Run the API**:
    ```shell
    dotnet run
    ```
    The API will be running on the port specified in `launchSettings.json` or `Program.cs`.

## Docker Configuration (Alternative)

For a production-like environment or if you prefer using Docker, you can use the provided `Dockerfile`. The original setup used Docker with a PostgreSQL database. While local development has been simplified to use SQL Server LocalDB, the Docker setup can still be adapted. Note that the database provider in the code is now SQL Server.

- **Dockerfile**
  - The API Dockerfile is configured to expose a port where the API will be running.
- **Original Docker Compose**
  - The original setup likely included a `docker-compose.yml` file to orchestrate the API and a PostgreSQL database container. This file would need to be modified to use a SQL Server for Linux container to work with the current code.

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
  - GET `/api/ScorecardResults/{scorecardId}/{holeId}`: Get a scorecard result.
  - PUT `/api/ScorecardResults/{scorecardId}/{holeId}`: Update a scorecard result.

- **Holes**
  - PUT `/api/Holes/{id}`: Update a hole.

- **Scorecard**
  - DELETE `/api/Scorecards/{id}`: Delete a scorecard.

- **Results**
  - GET `/api/TournamentRankings/{tournamentId}`: Get the ranking for a tournament.

## Swagger Documentation

The API provides Swagger documentation to help you understand the available endpoints and how to use them. You can access the Swagger documentation at `/swagger` when the API is running.

## CORS Configuration

CORS (Cross-Origin Resource Sharing) is configured to allow requests from any origin. You can further customize CORS settings in the code if needed.