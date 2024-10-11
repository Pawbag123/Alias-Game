# Node.js-Based Game "Alias"

## Table of Contents

### General

- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#rules)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#system-requirements#setup-and-installation)
- [Troubleshooting](../../README.md#system-requirements#troubleshooting)

### Technical

- Project Structure (core modules)?
- Data Architecture
  - [Data Base Schemas](./database-schemas.md#structure)
  - [Interfaces](./interfaces.md#game-interfaces-documentation)
  - [Dtos](#dtos)
- APIs
  - [Auth](../APIs/auth.md#authentication)
  - [Socket Events](../APIs/socket-events.md#socket-events-documentation)

### Additional Information

- [Security & Testing](documentation/security.md)
- [Deployment & Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)

## In this file:

- [Auth DTOs](#auth-dtos)
  - [CreateUserDto](#createuserdto)
  - [LoginUserDto](#loginuserdto)
  - [RefreshTokenDto](#refreshtokendto)
- [Game Room DTOs](#game-room-dtos)

  - [GameRoomDto](#gameroomdto)
  - [GameStartedDto](#gamestarteddto)

- [Lobby DTOs](#lobby-dtos)
  - [CreateGameDto](#creategamedto)
  - [InLobbyGameDto](#inlobbygamedto)
  - [JoinGameDto](#joingamedto)

## DTOs

Data Transfer Objects (DTOs) are used in the Alias Game project to ensure the correct structure and validation of the data exchanged between the client and server, enforcing specific validation rules to maintain data integrity.

<br>

## Auth DTOs

### CreateUserDto

Validates the data required for user registration.

### Values

- `username`: at least 6 characters, alphanumeric.
- `password`: at least 6 characters, including uppercase, lowercase, numbers, and special characters.

```typescript
class CreateUserDto {
  username: string;
  password: string;
}
```

### LoginUserDto

Used for login, ensuring the presence of both `username` and `password`.

```typescript
class LoginUserDto {
  username: string;
  password: string;
}
```

### RefreshTokenDto

Validates the presence of a valid `refreshToken` for refreshing the user's session.

```typescript
class RefreshTokenDto {
  refreshToken: string;
}
```

---

## Game Room DTOs

### GameRoomDto

Represents the structure of a game room. This DTO exposes:

### Values

- `id`: Unique identifier of the game room.
- `name`: The name of the room.
- `host`: The user who created the room.
- `redTeam` and `blueTeam`: Arrays of player usernames for each team.

```typescript
class GameRoomDto {
  id: string;
  name: string;
  host: string;
  redTeam: string[];
  blueTeam: string[];
}
```

### GameStartedDto

Provides the structure for a game that has started.

### Values

- `id`, `name`, `host`: Basic room details.
- `redTeam`, `blueTeam`: Arrays containing player usernames and whether they are active.
- `turn`: The current team’s turn.
- `currentWord`: The word being guessed, sent only to describer.
- `score`: Current score for both teams.

```typescript
class GameStartedDto {
  id: string;
  name: string;
  host: string;
  redTeam: [string, boolean][];
  blueTeam: [string, boolean][];
  turn: Turn;
  currentWord?: string;
  score: { red: number; blue: number };
}
```



## Lobby DTOs

### InLobbyGameDto

Represents a game that is visible in the lobby.

### Values

- `id`: Game identifier.
- `name`: The name of the game room.
- `players`: Current number of players.
- `maxPlayers`: Maximum number of players allowed.
- `started`: Whether the game has started or not.

```typescript
class InLobbyGameDto {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  started: boolean;
}
```
