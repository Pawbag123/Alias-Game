# Node.js-Based Game "Alias"

## Table of Contents

### General
- [Game Description](#game-description)
- [Rules](#rules)
- [System Requirements](#system-requirements)
- [Setup and Installation](#setup-and-installation)
- [Troubleshooting](#troubleshooting)

### Technical
- Project Structure
    - [Files & Folders](documentation/project-structure/files-and-folders.md#)
    - [Modules](documentation/project-structure/core-modules.md#)
- Data Architecture
    - [Data Base Schemas](documentation/data-architecture/database-schemas.md#structure)
    - [Interfaces](documentation/data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](documentation/data-architecture/dtos#dtos)
- APIs
    - [Auth](documentation/apis/auth.md#auth-controller)
    - [Socket Events](documentation/apis/socket-events#socket-events-documentation)
- Guides
    - [Testing](documentation/guides/testing.md)
    - [Deployment](documentation/guides/deployment.md)

### Additional Information
- [Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)

## In this file:

1. [Game Description](#game-description)
2. [Rules](#rules)
3. [System Requirements](#system-requirements)
4. [Setup and Installation](#setup-and-installation)
5. [Troubleshooting](#troubleshooting)

---

## Game Description
Alias is a word-guessing game built with Node.js as final project for LABA Solvd training backend bootcamp. In the game, players form teams, each team takes turns where one member describes a word and others guess it. 

### The game includes:
- Users system (auth, register, login).
- Room management throw game lobby where players can create game matches.
- Player profile where users can see stats (words guessed, games played, etc) 
- Chat for players to communicate.
- System to check for similar words.
- System for handling turns.


## Rules
The objective of the game is guess as many words as possible from their teammates' descriptions.

### Turns
Each turn is timed. Describers cannot use the word or its derivatives.

### Scoring
Points are awarded for each correct guess. Similar words are checked for validation.

### End Game
The game concludes after a predetermined number of rounds, with the highest-scoring team winning. Also teams can draw.

## System Requirements
**Enviorment**: Node.js

**Backend**: Nest.js<br>

**Database**: MongoDB<br>

**Frontend**: Handlebars - Bootstrap

<p>
  <a title="NodeJs">
    <img src="https://skillicons.dev/icons?i=nodejs" width="48" alt="NestJS">
  </a>
  <a title="TypeScript">
    <img src="https://skillicons.dev/icons?i=typescript" width="48" alt="TypeScript">
  </a>
  <a title="NestJS">
    <img src="https://skillicons.dev/icons?i=nestjs" width="48" alt="NestJS">
  </a>
  <a title="MongoDB">
    <img src="https://skillicons.dev/icons?i=mongodb" width="48" alt="PostgreSQL">
  </a>
  <a title="Docker">
  <img src="https://skillicons.dev/icons?i=docker" width="48" alt="Docker">
  </a>
  <a title="Handlebars">
    <img src="./src/public/images/Handlebars.png" width="48" alt="Handlebars">
  </a>
    <a title="Bootstrap">
    <img src="https://skillicons.dev/icons?i=bootstrap" width="48" alt="Bootstrap">
  </a>
</p>

## Setup and Installation

Follow these instructions to set up and run the game:

### Environment Variables
   - Create a `.env` file in the root folder `/Alias-Game`.
   - Inside this file, add the following variables with your own values:
   
   ```bash
   MONGO_URI = mongodb://localhost/aliasGame
   JWT_SECRET = <your-jwt-secret>
   JWT_REFRESH_SECRET = <your-jwt-refresh-secret>

   GOOGLE_CLIENT_ID = <your-google-client-id>
   GOOGLE_SECRET = <your-google-client-secret>
   GOOGLE_CALLBACK_URL = http://localhost:3000/auth/google/callback

   FRONTEND_URL = http://localhost:3000
   ```
   *Replace `<your-jwt-secret>`, `<your-jwt-refresh-secret>`, `<your-google-client-id>`, and `<your-google-client-secret>` with your own credentials.*

---

### Running the Project with Docker

1. **Ensure Docker is Installed**
   - Make sure Docker is installed and running on your machine. You can download Docker from the [official website](https://www.docker.com/products/docker-desktop).

2. **Set Up the `.env` File**
   - Ensure the `.env` file is created with the required environment variables. Refer to [this step](#environment-variables) in the previous guide for details.

3. **Build and Run the Docker Containers**
   - Run the following command to build and start the Docker containers:
   `docker-compose up --build`

4. **Access the Game**
   - Once the Docker containers are running, open your web browser and navigate to `http://localhost:3000` to start playing the game.

---

### Runing the project localy

#### Prerequisites

- Ensure you have **Node.js** installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- Make sure you have **MongoDB** installed. You can find installation instructions on the [MongoDB website](https://www.mongodb.com/try/download/community).
- Set up a **Google Cloud** project for OAuth 2.0 authentication. For more details, refer to the [Google Cloud documentation](https://cloud.google.com/docs).
  - Create OAuth credentials (Client ID and Secret).
  - Set authorized JavaScript origins URI to `http://localhost:3000`
  - Set the callback URI to `http://localhost:3000/auth/google/callback`.

### Steps

1. **Create a MongoDB Database**
   - Open your MongoDB shell or GUI.
   - Create a new database named `aliasGame`.

   Use the command: 
   ```bash
   use aliasGame
   ```
2. **Clone the Repository**
   - Use the following command to clone the repository to your local machine:
   ```bash
   git clone https://github.com/Pawbag123/Alias-Game
    ```
3. **Navigate to the Project Directory**
   - Change into the cloned repository directory:
   ```bash
   cd ./Alias-Game
    ```
4. **Install Dependencies**
   - Run the following command to install the necessary dependencies:
   `npm install`

5. **Start the Development Server**
   - Launch the server using:
   `npm run start:dev`

6. **Access the Game**
   - Open your web browser and navigate to `http://localhost:3000` to start playing the game.

### Troubleshooting

- If you encounter any issues during installation or running the server, ensure that MongoDB is running and that you have installed all required dependencies correctly.
