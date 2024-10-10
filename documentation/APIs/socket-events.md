### General

- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#rules)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#system-requirements#setup-and-installation)
- [Troubleshooting](../../README.md#system-requirements#troubleshooting)

### Technical

- Project Structure (core modules)?
- Data Architecture
  - [Data Base Schemas](documentation/data-architecture.md#data-base-schemas)
  - [Interfaces](documentation/data-architecture.md#Interfaces)
  - [Dtos](documentation/data-architecture.md#Dtos)
- APIs
  - [Auth](documentation/apis.md#auth)
  - [Socket events](#socket-events-documentation)

### Additional Information

- [Security & Testing](documentation/security.md)
- [Deployment & Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)

## In this file

1. [Lobby Gateway](#lobby-gateway)
2. [Socket Events](#socket-events)
   - [Connection Events](#connection-events)
   - [User Stats Event](#user-stats-event)
   - [Game Creation Event](#game-creation-event)
   - [Game Joining Event](#game-joining-event)

---

<br>

# Socket Events Documentation

## Lobby Gateway

### Description

The LobbyGateway handles WebSocket connections in the `"lobby"` namespace, managing events related to game creation and user interactions. It listens for incoming connections and disconnects, and it handles specific events related to user stats and game management.

---

## Socket Events

### Connection Events

- **Event**: Connection

  - **Description**: Triggered when a client connects to the lobby.
  - **Implementation**: The server logs the connection and checks whether user is already assigned to a game. If he is, client emit `"game:joined"`. Otherwise, client emit `"games:updated"` with current lobby games

  **Example Log**:
  Client connected to lobby: client_id

### - `"user-stats:get"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Requests the statistics for the connected user
- **Handler Description**: Get statistics for connected user, send them through client emit `"user-stats"`
- **Payload**: None
  <!-- - **Response**: Emits user statistics back to the requesting client. -->

    <!-- **Example Request**:
  
    ```json
    {
      "event": "user-stats:get"
    }
    ```
  
    **Example Response**:
  
    ```json
    {
      "userName": "exampleUser",
      "gamesPlayed": 10,
      "wins": 5,
      "losses": 3
    }
    ``` -->

### - `"game:create"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Requests the creation of a new game
- **Validation**:

  - user cannot be already active (in a game)
  - game name cannot exist currently

- **Handler Description**: Create new game with player info, create new active user with initial timeout (if user doesn't join room in time, handle cleanup). client emit: `"game:created"`. client broadcast `"games:updated"`
- **Payload**:

  - gameName: string - The name of the game to be created

  **Example Request**:

  ```json
  {
    "gameName": "My New Game"
  }
  ```

### - `"game:join"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Requests to join an existing game
- **Validation**:
  - user cannot be active (already in game)
  - game must exist
  - game cannot be full
  - game cannot be started
- **Handler Description**: Create new active user with initial timeout (as in previous event), add player info to game. Client emit: `"game:joined"`, client broadcast:`"games:updated"`
- **Payload**:
  - gameId: string - The ID of the game to join.
- **Response**: Emits game:joined to the requesting client and games:updated to all clients.

  **Example Request**:

  ```json
  {
    "gameId": "existingGameId"
  }
  ```

### - `"game:created"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send newly created game's id
- **Handler Description**: Redirect to `"game/:gameId"`
- **Payload**:
  - gameId: string

**Example Request**:

```json
"f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### - `"game:joined"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send joined game's id
- **Handler Description**: Redirect to `"game/:gameId"`
- **Payload**:
  - gameId: string

**Example Request**:

```json
"f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### - `"games:updated"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Sends all lobby rooms info
- **Handler Description**: Update displayed lobby data
- **Payload**:
  - InLobbyGameDto[]

**Example Payload**:

```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Juann3's Game",
    "players": 3,
    "maxPlayers": 6,
    "started": false
  },
  {
    "id": "9e107d9d-372d-4d28-9f39-2e335a9e6509",
    "name": "Juann4's Game",
    "players": 1,
    "maxPlayers": 6,
    "started": false
  }
]
```

### - `"user-stats"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Sends connected user's statistics
- **Handler Description**: Display received data in modal
- **Payload**:

  - userName: string - The name of the connected user
  - gamesPlayed: number - number of games played
  - wins: number - numbers of games won
  - loses: number - number of games lost
  - draw: number - number of games resulted in draw
  - wordsGuessed: number - number of words guessed in all games
  - wellDescribed: number - number of words described by user that were correctly guessed

  **Example Payload**:

  ```json
  {
    "userName": "Juann1",
    "gamesPlayed": 26,
    "wins": 2,
    "loses": 6,
    "draw": 18,
    "wordsGuessed": 2,
    "wellDescribed": 13
  }
  ```

### `"exception"`

- **Handler**: Client
- **Handler Description**: Display received error message in modal

**Example Payload**:

```json
{
  "status": "error",
  "message": "Game already started"
}
```

---

## Game Room Gateway

### Description

The GameRoomGateway manages WebSocket connections in the `"game-room"` namespace, handling events related to team assignments, game management, and chat functionality.

### Socket Events

### - `"game-room:leave"`

- **Description**: Requests to leave the game room.
- **Payload**: None
- **Response**: Emits game-room:left to the requesting client and disconnects them.

  **Example Request**:

  ```json
  {
    "event": "game-room:leave"
  }
  ```

  **Example Response**:

  ```json
  {
    "message": "You have left the game room."
  }
  ```

### - `"game-room:join"`

- **Description**: Requests to join a specified team in the game.
- **Payload**:
  - team: Team - The team to join.
- **Response**: Emits updated game room to all clients in the room.

  **Example Request**:

  ```json
  {
    "event": "game-room:join",
    "data": {
      "team": "redTeam"
    }
  }
  ```

  **Example Response**:

  ```json
  {
    "message": "Successfully joined the red team."
  }
  ```

### - `"game-room:start"`

- **Description**: Requests to start the game.
- **Payload**: None
- **Response**: Emits game-started to all clients in the room.

  **Example Request**:

  ```json
  {
    "event": "game-room:start"
  }
  ```

  **Example Response**:

  ```json
  {
    "message": "The game has started."
  }
  ```

### - `"chat:message"`

- **Description**: Sends a chat message within the game room.
- **Payload**:
  - message: string - The chat message to be sent.
- **Response**: Emits chat:update to all clients in the room.

  **Example Request**:

  ```json
  {
    "event": "chat:message",
    "data": {
      "message": "Hello everyone!"
    }
  }
  ```

  **Example Response**:

  ```json
  {
    "message": "Chat message sent."
  }
  ```

## Conclusion

This socket event documentation outlines the key events used in the lobby for managing user interactions and game management. Understanding these events helps in implementing real-time features and enhancing user experience within the lobby.
