# Node.js-Based Game "Alias"

## Table of Contents

### General
- [Game Description](#game-description)
- [Rules](#rules)
- [System Requirements](#system-requirements)
- [Setup and Installation](#setup-and-installation)
- [Troubleshooting](#troubleshooting)

### Technical
- Project Structure (core modules)?
- Data Architecture
    - [Data Base Schemas](documentation/data-architecture/database-schemas.md#structure)
    - [Interfaces](documentation/data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](documentation/data-architecture/dtos#dtos)
- APIs
    - [Auth](documentation/apis/auth.md#auth-controller)
    - [Socket Events](documentation/apis/socket-events#socket-events-documentation)

### Additional Information
- [Security & Testing](documentation/security.md)
- [Deployment & Future Enhancements](documentation/deployment.md)
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
**Backend**: Node.js - Nest.js<br>

**Database**: MongoDB<br>

**Frontend**: Handlebars 

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
<a title="Handlebars">
  <img src="https://github.com/user-attachments/assets/06aef053-dd04-437f-a353-943e3d100215" width="48" alt="Handlebars">
</a>
</p>

## Setup and Installation

Follow these instructions to set up and run the game:

### Prerequisites

- Ensure you have **Node.js** installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- Make sure you have **MongoDB** installed. You can find installation instructions on the [MongoDB website](https://www.mongodb.com/try/download/community).

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
   ```bash
   npm install
    ```
5. **Enviroment Variables**
   - Add .env file in root folder /Alias-Game
   ```bash
   MONGO_URI = mongodb+srv://solvd-team-3:2prHVO2HGozJkXOh@solvd-project.e9zpm.mongodb.nealiasGame?retryWrites=true&w=majority&appName=solvd-project
   JWT_SECRET = 9XEvn7G-Ip56QBVEo9cD4xC5BqtBTMyLGC5aj3Qcs1s=
   JWT_REFRESH_SECRET = AxI2tJ6FLVii9Ra9JDC7Wb0hydO9uAKUaDTrPgDrm4g
    ```

6. **Start the Development Server**
   - Launch the server using:
   ```bash
   npm run start:dev
    ```
7. **Access the Game**
   - Open your web browser and navigate to `http://localhost:3000` to start playing the game.

### Troubleshooting

- If you encounter any issues during installation or running the server, ensure that MongoDB is running and that you have installed all required dependencies correctly.
