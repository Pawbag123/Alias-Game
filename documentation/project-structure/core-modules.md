# Core modules

## Overview

This project includes several key modules that work together to manage game logic, real-time communication, and game state persistence. Below is an overview of the core modules with a focus on the **Game Room Module**, its **Service**, and **Gateway**.

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

### Game Room Gateway

The `GameRoomGateway` manages WebSocket connections for the game room, handling events such as connecting, disconnecting, starting games, and sending messages.

#### Key Features:
- **handleConnection**: Handles player connections, assigns them to the correct game room, and restores any missed messages. If the game has started, it invokes the appropriate game mechanics.
- **handleDisconnect**: Manages player disconnections. If the game is in progress, only the `socketId` is removed to allow reconnections; otherwise, the player is fully removed from the game.
- **handleJoinTeam**: Allows players to join a team (e.g., red or blue) and emits the updated game state to the room.
- **handleStartGame**: Initiates the game, delegating the game start logic to the `GameMechanicsService`.
- **handleChatMessage**: Processes chat messages during the game. It handles both regular chat messages and in-game word guessing, interacting with the `ChatService` and `GameMechanicsService` as needed.

This gateway uses the `GameRoomService` for managing connections and team-related logic, while the `GameMechanicsService` controls game flow and mechanics.

#### Key Functions:
- `handleDisconnect()`: Manages player disconnections and updates the game state.
- `handleReconnect()`: Reintegrates players who reconnect to a game in progress.
- `handlePlayerMessage()`: Handles incoming messages from players (either chat or word guesses) and processes them.

## Game State Service

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

#### Key Functions:
- **handleConnection**: When a client connects to the lobby namespace, it emits the current games to the client.
- **handleGameCreate**: Invokes the `LobbyService` to create a new game and then notifies all clients.
- **handleGameJoin**: Handles user requests to join an existing game, notifying all clients of the updated game state.

<br>

---

These core modules form the backbone of the game's real-time functionality, ensuring smooth gameplay and communication between players in a synchronized, round-based format.

---



