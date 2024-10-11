# Node.js-Based Game "Alias"

## Table of Contents

### General

- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#rules)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#setup-and-installation)
- [Troubleshooting](../../README.md#troubleshooting)

### Technical

- Project Structure
    - [Files & Folders]
    - [Modules]
- Data Architecture
    - [Data Base Schemas](../data-architecture/database-schemas.md#structure)
    - [Interfaces](../data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](../data-architecture/dtos.md#dtos)
- APIs
    - [Auth](auth.md#authentication)
    - [Socket Events](#socket-events-documentation)
- Guides
    - [Testing](../guides/testing.md#running-tests-in-nestjs-with-jest)
    - [Deployment](../guides/deployment.md#deploying-a-nestjs-application-to-heroku)

### Additional Information

- [Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)

## In this file

1. [Lobby Gateway](#lobby-gateway)
   - [Description](#description)
   - [Connection Parameters](#connection-parameters)
   - [Middlewares before connection](#middlewares-before-connection)
   - [Events](#events)
     <!-- - [Connection](#-connection)
     - [user-stats:get](#-user-statsget)
     - [game:create](#-gamecreate)
     - [game:join](#-gamejoin)
     - [game:created](#-gamecreated)
     - [game:joined](#-gamejoined)
     - [games:updated](#-gamesupdated)
     - [user-stats](#-user-stats)
     - [exception](#-exception) -->

2. [Game Room Gateway](#game-room-gateway)
   - [Description](#description-1)
   - [Connection Parameters](#connection-parameters-1)
   - [Middlewares before connection](#middlewares-before-connection-1)
   - [Events](#events-1)
     <!-- - [`Connection`](#-connection-1)
     - [Disconnection](#-disconnection)
     - [game-room:leave](#-game-roomleave)
     - [game-room:join](#-game-roomjoin)
     - [game-room:start](#-game-roomstart)
     - [user-stats:get](#-user-statsget-1)
     - [chat:message](#-chatmessage)
     - [game-room:left](#-game-roomleft)
     - [user-stats](#-user-stats-1)
     - [game-room:updated](#-game-roomupdated)
     - [game-started:updated](#-game-startedupdated)
     - [chat:update](#-chatupdate)
     - [game:end](#-gameend)
     - [timer:update](#-timerupdate)
     - [exception](#-exception-1) -->

---

<br>

# Socket Events Documentation

## Lobby Gateway

### Description

The LobbyGateway handles WebSocket connections in the `"lobby"` namespace, managing events related to game creation and user interactions. It listens for incoming connections and disconnects, and it handles specific events related to user stats and game management.

---

### Connection Parameters

```javascript
socket = io('/lobby', {
  // namespace
  auth: { token: accessToken }, // auth token
});
```

---

### Middlewares before connection

- #### Token Middleware

  Prevents unauthorized connections, verifies access token, and assigns `userId` and `userName` to socket

- #### Single User Middleware

  Prevents connections when there's already `ActiveUser` using same credentials

---

### Events

### - `Connection`

- **Description**: Triggered when socket is connecting to `"lobby"` namespace. The server checks whether user is already assigned to a game. If he is, client emit `"game:joined"`. Otherwise, client emit `"games:updated"` with current lobby games

### - `"user-stats:get"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Requests the statistics for the connected user
- **Handler Description**: Get statistics for connected user, send them through client emit `"user-stats"`
- **Payload**: None

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

---

### Connection Parameters

```javascript
socket = io('/game-room', {
  // namespace
  query: {
    gameId: gameRoomId, // id of game room
    serverOffset: 0,
  }, // message offset
  auth: {
    token: accessToken, //auth token
  },
});
```

---

### Middlewares before connection

- #### Token Middleware

  Prevents unauthorized connections, verifies access token, and assigns `userId` and `userName` to socket

- #### Single User Middleware

  Prevents connections when there's already `ActiveUser` using same credentials

- #### Allowed to Game Middleware
  Prevents connections on nonExistent games and games that user isn't allowed to join

---

### Events

### - `Connection`

- **Description**: Triggered when socket is connecting to `"game-room"` namespace.
  - assign `"gameId"` passed in query to socket
  - if game is started - validate if user can join, set his socket id appropriately, room emit `"game-started:updated"`, send reconnect info by room emit`"chat-update"`
  - if game is not started - clear initialJoin timeout, set his socket id appropriately, room emit `"game-room:updated"`, send join info by room emit`"chat-update"`
  - recover messages and client emit`"chat:update"` for each.

### - `Disconnection`

- **Description**: Triggered when socket is disconnecting from `"game-room"` namespace
  - if game is started - remove active user socketId, as it allows for rejoin. room emit`"game-started:update"`, send disconnect info by room emit`"chat-update"`
  - if game is not started (also triggered on `"game-room:left"` disconnection) - remove active user, remove player from game, eventually move host or remove game if empty. if game exists, room emit`"game-room:updated"`, send disconnect info by room emit`"chat-update"`, emit `"lobby/games:updated"`

### - `"game-room:leave"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Request to leave room
- **Handler Description**: client emit`"game-room:left"`, disconnect client socket
- **Payload**: None

### - `"game-room:join"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Request to join a certain team
- **Handler Description**: Move player to team, room emit `"game-room:updated"`
- **Payload**:
  - team: Team - team to join

**Example Payload**:

```json
{
  "team": "redTeam"
}
```

### - `"game-room:start"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Request to start the game
- **Validation**
  - Client sending request is host of the game
  - At least 2 players are in each team
- **Handler Description**: Set game as started, emit `"lobby/games:updated"`, handle turns, timer and game mechanics. on each update, emit room`"game-started:updated"`.
- **Payload**: None

### - `"user-stats:get"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Request for statistics of clicked user
- **Handler Description**: fetch statistics by name, emit client`"user-stats"` with data
- **Payload**:
  - userName: string - name of user

**Example Payload**:

```json
{
  "userName": "Juann2"
}
```

### - `"chat:message"`

- **Emitter**: Client
- **Handler**: Server
- **Emit Description**: Send a message through chat
- **Validation**
  - validate if user is in guessing team/describer (after game started)
  - validate message sent by describer by similarity algorithm
- **Handler Description**:
  - game room before start - save message in chat in database, room emit`"chat:update"`
  - send as describer - save message in chat in database, room emit`"chat:update"`
  - send as guesser - save message in chat in database, room emit`"chat:update"`. If guessed, send info, update score and word, room emit`"game-started:updated"`
- **Payload**:

**Example Payload**:

```json
{
  "message": "prairie"
}
```

### - `"game-room:left"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send info that room was properly left, client: `"disconnect"`
- **Handler Description**: Redirect to `"lobby"`
- **Payload**: None

### - `"user-stats"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Fetch and send statistics of user with provided name
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

### - `"game-room:updated"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send information about updated game room (before game started)
- **Handler Description**: Display updated game room state
- **Payload**:
  - GameRoomDto

**Example Payload**:

```json
{
  "id": "y1wm80g1r",
  "name": "Juann4's Game",
  "host": "6705c8f8e34928a78930d707",
  "redTeam": ["Juann4"],
  "blueTeam": ["pawbag1231", "Juann1"]
}
```

### - `"game-started:updated"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send information about updated game (after game started)
- **Handler Description**: Display updated game state
- **Payload**:
  - GameStartedDto

**Example Payload**:

```json
{
  "id": "y1wm80g1r",
  "name": "Juann4's Game",
  "host": "6705c8f8e34928a78930d707",
  "redTeam": [
    ["Juann4", true],
    ["Juann3", true]
  ],
  "blueTeam": [
    ["pawbag1231", true],
    ["Juann1", true]
  ],
  "turn": {
    "alreadyDescribed": [
      "67081944393329b9b14c18da",
      "6705c8f8e34928a78930d707"
    ],
    "team": "blueTeam",
    "describerId": "6705c7b8e34928a78930d6f7",
    "describerName": "Juann1"
  },
  "currentWord": "truck",
  "score": {
    "red": 0,
    "blue": 1
  }
}
```

### - `"chat:update"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send a new message to game room
- **Handler Description**: Display message in chat
- **Payload**:
  - userId? : string - id of user (absent if server sent message)
  - userName : string - name of user
  - gameId : string - id of game
  - message : string - message to be sent
  - time : string - Time of sending message
  - messageId : string - Id of message (absent if server sent message)

**Example Payload**:

```json
{
  "userId": "6705c7b8e34928a78930d6f7",
  "userName": "Juann1",
  "gameId": "y1wm80g1r",
  "message": "my message",
  "time": "2024-10-10T21:37:13.762Z",
  "messageId": "670849097eb27532805221ad"
}
```

### - `"game:end"`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Emitted to all sockets in game at end of the game. Saves data to database, cleans real-time data about game and users, disconnects sockets present in game room
- **Handler Description**: Display result modal, redirect to `"lobby"`
- **Payload**:
  - GameStartedDto

**Example Payload**:

```json
{
  "id": "y1wm80g1r",
  "name": "Juann4's Game",
  "host": "6705c8f8e34928a78930d707",
  "redTeam": [
    ["Juann4", true],
    ["Juann3", true]
  ],
  "blueTeam": [
    ["pawbag1231", true],
    ["Juann1", true]
  ],
  "turn": {
    "alreadyDescribed": [
      "67081944393329b9b14c18da",
      "6705c8f8e34928a78930d707",
      "6705c7b8e34928a78930d6f7"
    ],
    "team": "redTeam",
    "describerId": "6705c8eee34928a78930d703",
    "describerName": "Juann3"
  },
  "score": {
    "red": 0,
    "blue": 1
  }
}
```

### `timer:update`

- **Emitter**: Server
- **Handler**: Client
- **Emit Description**: Send updated time remaining in turn
- **Handler Description**: Display remaining time
- **Payload**:
  - remaining: number - remaining time (in seconds)

**Example Payload**:

```json
{
  "remaining": 16
}
```

### `"exception"`

- **Handler**: Client
- **Handler Description**: Display received error message in modal

**Example Payload**:

```json
{
  "status": "error",
  "message": "Message is not allowed"
}
```

## Conclusion

This socket event documentation outlines the key events used in the lobby for managing user interactions and game management. Understanding these events helps in implementing real-time features and enhancing user experience within the lobby.
