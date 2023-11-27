# Better Golf - Client

Welcome to the Golf Tournament Manager Client application. This client is part of a web application built with React and interacts with the Golf Tournament Manager API to manage golf tournaments, including players, tournaments, categories, courses, holes, scorecards, and results. This README will provide an overview of the client application and how to use it.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Vite Configuration](#vite-configuration)
- [Docker Configuration](#docker-configuration)
- [Running the Client](#running-the-client)

## Prerequisites

Before you start using this client application, make sure you have the following prerequisites installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/get-npm)

## Getting Started

1. Clone the repository to your local machine.

2. Open the terminal and navigate to the client project directory.

3. Run the following command to install the project dependencies:

   ```shell
   npm install
   ```
   This command will install all the required dependencies for the client application.

## Project Structure

The client project follows a typical React project structure. Here is a brief overview of the project structure:

- **src**: Contains the source code for the client application.
  - **App.jsx**: The main component of the application.
  - **api**: Contains API service files for different entities like categories, courses, holes, players, and tournaments.
  - **assets**: Contains SVG icon components.
  - **components**: Contains reusable UI components used in the application.
  - **pages**: Contains different pages or views of the application, each representing a different part of the golf tournament management.

- **public**: Contains static assets like images and icons used in the application.

- **package.json**: Defines project dependencies and scripts for development and production builds.

- **vite.config.js**: Configuration for the Vite development server.

## Vite Configuration

The `vite.config.js` file configures the development server for the client application. The important settings include:

- `port`: The port on which the client application will run. The default is set to 3000.

- `host`: The host for the client application. It is set to "0.0.0.0" to allow access from external sources.

## Docker Configuration

The provided Dockerfile allows you to containerize the client application for deployment. It is based on the Node.js image and exposes port 3000. You can build and run the client application inside a Docker container using this Dockerfile.
Run the following command to build the Docker image:

```shell
docker-compose build
```

## Running the Client

To run the client application locally, navigate to the client project directory in the terminal and run the following command:

```shell
npm run dev
```

To run the client application in a Docker container, run the following command:

```shell
docker-compose up
```

The client application will start and be accessible at `http://localhost:3000`.

That's it! You now have the Better Golf application up and running. You can explore the application to manage golf tournaments, including players, tournaments, categories, courses, holes, scorecards, and results.

Please note that this README provides an overview of the client application and its structure. Detailed documentation for each part of the application and its functionality should be available in the code and comments within the project.