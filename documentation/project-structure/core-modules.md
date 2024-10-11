# Node.js-Based Game "Alias"

## Table of Contents

### General

- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#rules)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#system-requirements#setup-and-installation)
- [Troubleshooting](../../README.md#system-requirements#troubleshooting)

### Technical

- Project Structure
  - [Files & Folders](./files-and-folders.md#directory-structure)
  - [Modules](#core-modules)
- Data Architecture
  - [Data Base Schemas](./database-schemas.md#structure)
  - [Interfaces](#game-interfaces-documentation)
  - [Dtos](./dtos.md#dtos)
- APIs
  - [Auth](../APIs/auth.md#authentication)
  - [Socket Events](../APIs/socket-events.md#socket-events-documentation)
- Guides
  - [Testing](../guides/testing.md#running-tests-in-nestjs-with-jest)
  - [Deployment](../guides/deployment.md#deploying-a-nestjs-application-to-heroku)

### Additional Information

- [Future Enhancements](../future-enhancements.md#future-enhancements)
- [FAQ](../FAQ.md#faq)

## In this file:

1. [Core Modules](#core-modules)
2. [Game Room Module](#game-room-module)
   - [Game Room Service](#game-room-service)
   - [Game Room Gateway](#game-room-gateway)
   - [Game State Service](#game-state-service)
3. [Lobby Module](#lobby-module)
   - [Lobby Service](#lobby-service)
   - [Lobby Gateway](#lobby-gateway)

# Core modules

## Game Room Module

The Game Room Module is responsible for managing game rooms where players can join, interact, and play the word guessing game. It coordinates game state transitions, communication between clients, and the handling of game events.

### Game Room Service

The `GameRoomService` is responsible for managing the transition of players between the lobby and the game room. It handles various game-related operations like adding players to the game, managing team assignments, and updating the state of the game room.

#### Key Functions:

- **addPlayerToGame**: Adds a player to the game and assigns them a `socketId` for managing connections.
- **handleUserConnectToGameRoom**: Manages user connections to the game room, adding the user to the correct room and notifying other players.
- **handleUserDisconnectFromGameRoom**: Handles player disconnections, ensuring the player is removed from the game and the game state is updated accordingly.
- **joinTeam**: Allows users to join a specific team, updating the game state and notifying other players in the room.
- **isGameStarted**: Checks whether the game associated with a particular game ID has started.
- **updateGamesInfoAfterDisconnect**: Updates the game state and informs the lobby and game room when a player disconnects.

The service leverages the `GameStateService` to track and manipulate the state of active games and players.

### Game Mechanics Service

The `GameMechanicsService` is responsible for managing all the logic required to make the game working properly. It includes logic for starting games, checking guessed words, handling turns and so on.

#### Key Functions:

- **startGame**: sets game state as started, handles Turns
- **handleTurns**: Contains all logic behind handling turns, emitting words to describer, updating timer, validating guessed/ described words.
- **handlePlayerReconnect**: Handle user reconnection to room
- **handleDescriberMessage**: Validate if describer is sending proper message
- **handleGuessingPlayerMessage**: Check if message is correct guess
- **getUserStats**: Get chosen user's statistics

### Game Room Gateway

The `GameRoomGateway` manages WebSocket connections for the game room, handling events such as connecting, disconnecting, starting games, and sending messages.

You can see more detail information about the game room gateway [here](../APIs/socket-events.md#game-room-gateway)

### Game State Service

The **GameStateService** is crucial for persisting the game state and ensuring continuity, even when players reconnect. It is responsible for:

- Managing the in-memory representation of games, players, and scores.
- Storing active game data such as current word, describer, and teams' scores.
- Saving and updating game states as the game progresses.

## Lobby Module

The `Lobby Module` is responsible for managing game creation, user connections, and joining games in the lobby. It leverages WebSockets for real-time communication between clients and the server, using `Socket.IO`. The module provides functionalities for users to create and join games, and it keeps track of the current games in the lobby.

### Lobby Service

The `LobbyService` contains the core business logic for the lobby. It handles game creation, user joining, and connection events. The service communicates with the `GameStateService` to manage the game's lifecycle and user participation.

#### Key Functions:

- **createGame**: Creates a new game and adds a user to it. Emits events to notify all connected clients about the newly created game.
- **joinGame**: Allows a user to join an existing game by validating the user's data and the game's capacity.
- **handleConnection**: Manages user connections to the lobby, sending them the current list of active games.
- **gameJoinHandler** and **gameCreateHandler**: These are callback functions to update all clients in the lobby whenever a user joins or creates a game.

### Lobby Gateway

The `LobbyGateway` listens for WebSocket connections from clients. It manages client connection and disconnection events, and facilitates communication between clients and the `LobbyService` for game-related actions.

You can see more detail information about the lobby gateway [here](../APIs/socket-events.md#lobby-gateway)

<br>

---

These core modules form the backbone of the game's real-time functionality, ensuring smooth gameplay and communication between players in a synchronized, round-based format.

---
