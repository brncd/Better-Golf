# Better Golf API

## Overview
Better Golf API is a robust and complete backend designed for managing golf tournaments. It provides a solid foundation for golf club applications, enabling the administration of players, courses, tournaments, and results. The API is built with a modern approach using .NET and ASP.NET Core Minimal APIs, offering high performance and an easy-to-maintain structure.

The API supports multiple game formats, a complete tournament lifecycle, and an authentication/role system for secure management.

---

## Key Features

- **Golf Entity Management:** Full CRUD for Courses, Holes, Categories, and Player Profiles.  
- **Tournament Lifecycle:** Well-defined state flow (`Draft`, `OpenRegistration`, `InProgress`, `Completed`, `Archived`) with associated business logic.  
- **Multiple Game Formats:**
  - **Stroke Play (Medal Play):** Score calculation by strokes.  
  - **Stableford:** Point-based scoring.  
  - **Match Play:** Support for head-to-head matches, with match generation and hole-by-hole result tracking.  
- **Automated Results & Rankings:**
  - Automatic calculation of final tournament standings.  
  - **Tiebreak Logic (Countback):** Tiebreak system using the last 9, 6, 3, and 1 holes to determine a unique winner.  
- **Round & Tee Time Management:**
  - Create rounds for multi-day tournaments.  
  - Automatic tee time generation, supporting both standard and shotgun starts.  
- **Flexible Handicap System:**
  - Calculation of playing handicap based on a player’s handicap index and course characteristics (Slope, Rating, Par).  
  - **Handicap Allowance:** Configure tournament-specific percentage adjustments to comply with official rules.  
- **Authentication & Authorization:**
  - System based on **ASP.NET Core Identity** with **JWT tokens**.  
  - **User Roles:** Three predefined access levels (`Admin`, `TournamentOrganizer`, `Player`).  
  - **Self-registration:** Users can sign up and create their own linked player profile.  
  - **Tournament Registration:** Players can self-register for open tournaments.  
- **API Documentation:** Automatic documentation generation with **Swagger / OpenAPI**.  

---

## Tech Stack

- **Framework:** .NET 8  
- **API:** ASP.NET Core Minimal APIs  
- **Database:** Entity Framework Core 8 with SQL Server  
- **Authentication:** ASP.NET Core Identity  
- **Authorization:** JSON Web Tokens (JWT)  
- **Validation:** FluentValidation  

---

## Prerequisites

- .NET 8 SDK
- SQL Server (Express, Developer, or a Docker instance are all valid options).  

---

## Installation & Setup

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Better-Golf/Api
    ```

2. **Configure Database Connection:**
    - Open `appsettings.Development.json`.  
    - Update the `DefaultConnection` string to point to your SQL Server instance.  
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=YOUR_SERVER;Database=BetterGolfDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true"
    }
    ```

3. **Configure JWT Key:**
    - Open `appsettings.json`.  
    - Update `Jwt:Key` with a long, secure secret value. **Do not use the default value in production.**  
    ```json
    "Jwt": {
      "Key": "YOUR_SUPER_LONG_SECURE_SECRET_KEY_HERE",
      "Issuer": "BetterGolfApi",
      "Audience": "BetterGolfApp"
    }
    ```

4. **Apply Database Migrations:**
    - Open a terminal in the `Api/` directory.  
    - Run the following command to create the database schema from EF Core migrations:  
    ```bash
    dotnet ef database update
    ```

5. **Run the API:**
    ```bash
    dotnet run
    ```
    The API will be available at `localhost:5001`.

---

## API Usage

### Interactive Documentation

The easiest way to explore and test all endpoints is via Swagger UI.  

- **Swagger URL:** `localhost:5001/swagger`

### Authentication Flow

1. **User Registration:** `POST /register` - Creates a new user account (without a player profile yet).  
2. **Login:** `POST /login` - Authenticates the user and returns a JWT token.  
3. **Authorized Calls:** For all endpoints requiring authentication, include the token in the request header:  
    ```
    Authorization: Bearer <your-jwt-token>
    ```

### Common Workflows

Below are some high-level workflows for common tasks.  

#### Player Workflow

1. **Create account and profile:**
    - `POST /register` to create the account.  
    - `POST /login` to obtain the token.  
    - `POST /api/me/player-profile` to create a player profile linked to the account.  
2. **Register for a tournament:**
    - `GET /api/Tournaments` to view available tournaments.  
    - `POST /api/tournaments/{tournamentId}/register` to sign up for a tournament in `OpenRegistration` state.  

#### Tournament Organizer Workflow

1. **Prepare environment:**
    - (Admin) `POST /api/Courses` and `POST /api/Holes` to create courses and holes.  
    - (Admin) `POST /api/Categories` to create categories.  
2. **Create & configure tournament:**
    - `POST /api/Tournaments` to create a tournament, specifying format, dates, and `HandicapAllowance`.  
    - `POST /api/tournaments/{tournamentId}/categories/{categoryId}` to link categories to the tournament.  
    - `PUT /api/tournaments/{tournamentId}/status` to switch to `OpenRegistration`.  
3. **Manage tournament:**
    - Once registration is closed, `PUT /api/tournaments/{tournamentId}/status` to switch to `InProgress`.  
    - `POST /api/tournaments/{tournamentId}/rounds` to create tournament rounds.  
    - `POST /api/tournaments/{tournamentId}/generate-teetimes` to generate tee times.  
    - (For Match Play) `POST /api/tournaments/{tournamentId}/generate-matches` to create matches.  
4. **Enter & finalize results:**
    - `PUT /api/scorecardresults/{...}` to record strokes in Stroke Play/Stableford tournaments.  
    - `POST /api/matches/{matchId}/holes` to record hole winners in Match Play.  
    - `PUT /api/tournaments/{tournamentId}/status` to switch to `Completed` (this locks scorecards).  
    - `POST /api/tournaments/{id}/calculate-results` to generate the final leaderboard (Stroke Play/Stableford only).  

---

## Project Structure

- `/Data`: Contains the Entity Framework `DbContext` and all database migrations.  
- `/Models`: Contains domain models, DTOs (Data Transfer Objects), and Enums.  
- `/Services`: Contains core business logic, separated by domain (Player, Tournament, etc.).  
- `/Middleware`: Contains custom middleware, such as the exception handler.  
- `/Validation`: Contains FluentValidation rules.  
- `Program.cs`: API entry point. Configures services, middleware pipeline, and defines all endpoints (Minimal APIs).  

---

## Contributions

This project follows the **GitFlow** workflow. Please make all new features and bug fixes on branches created from `develop`.
