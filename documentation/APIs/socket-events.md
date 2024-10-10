
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
The LobbyGateway handles WebSocket connections in the lobby namespace, managing events related to game creation and user interactions. It listens for incoming connections and disconnects, and it handles specific events related to user stats and game management.

---

## Socket Events

### Connection Events

- **Event**: Connection
  - **Description**: Triggered when a client connects to the lobby.
  - **Implementation**: The server logs the connection and emits the current game state to the newly connected client.

  **Example Log**:
  Client connected to lobby: client_id



### - `"user-status:get"`
- **Description**: Requests the statistics for the connected user.
- **Payload**: None
- **Response**: Emits user statistics back to the requesting client.

  **Example Request**:
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
  ```
### - `"game:create"`

- **Description**: Requests the creation of a new game.
- **Payload**: 
  - gameName: string - The name of the game to be created.
- **Response**: Emits game:updated to all clients to notify them of the new game.

  **Example Request**:
  ```json
  {
      "event": "game:create",
      "data": {
          "gameName": "My New Game"
      }
  }
  ```
  **Example Response**:
  ```json
  {
      "message": "Game created successfully",
      "gameId": "newGameId"
  }
  ```
### - `"game:join"`

- **Description**: Requests to join an existing game.
- **Payload**: 
  - gameId: string - The ID of the game to join.
- **Response**: Emits game:joined to the requesting client and games:updated to all clients.

  **Example Request**:
  ```json 
  {
      "event": "game:join",
      "data": {
          "gameId": "existingGameId"
      }
  }
  ```

  **Example Response**:
  ```json
  {
      "message": "Successfully joined the game",
      "gameId": "existingGameId"
  }
  ```

---

## Game Room Gateway

### Description
The GameRoomGateway manages WebSocket connections in the game room namespace, handling events related to team assignments, game management, and chat functionality.

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
### - `"user-stats:get"`

- **Description**: Requests user statistics for a specified user.
- **Payload**: 
  - userName: string - The name of the user whose stats are requested.
- **Response**: Emits user statistics back to the requesting client.

  **Example Request**:
  ```json
  {
      "event": "user-stats:get",
      "data": {
          "userName": "exampleUser"
      }
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
