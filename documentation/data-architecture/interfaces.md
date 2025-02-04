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
    - [Files & Folders](../project-structure/files-and-folders.md#directory-structure)
    - [Modules](../project-structure/core-modules.md#core-modules)
- Data Architecture
    - [Data Base Schemas](./database-schemas.md#structure)
    - [Interfaces](#game-interfaces-documentation)
    - [Dtos](./dtos.md#dtos)
- APIs
    - [Auth](../APIs/auth.md#authentication)
    - [Socket Events](../APIs/socket-events.md#socket-events-documentation)
- Guides
    - [Testing](../guides/testing.md#running-tests-in-nestjs-with-jest)
    - [Deployment](../guides/deployment.md#deploying-a-nestjs-application-to-aws-ec2)

### Additional Information

- [Future Enhancements](../future-enhancements.md#future-enhancements)
- [FAQ](../FAQ.md#faq)

## In this file:

1. [Game Interface](#game-interface)
2. [WordStatus Enum](#wordstatus-enum)
3. [Turn Interface](#turn-interface)
4. [Stats Interface](#stats-interface)
5. [InGameStats Interface](#ingamestats-interface)
6. [ActiveUser Interface](#activeuser-interface)
7. [Team Enum](#team-enum)
8. [ActivePlayer Type](#activeplayer-type)
9. [Player Interface](#player-interface)

---
# Game Interfaces Documentation

## Game Interface

### Description
The `Game` interface represents the state of a game, including its participants, status, and scores.

### Properties
- **id**: string - Unique identifier for the game.
- **name**: string - Name of the game.
- **host**: string - User ID of the game host.
- **isGameStarted**: boolean - Indicates if the game has started.
- **players**: Player[] - Array of players in the game.
- **maxUsers**: number - Maximum number of users allowed in the game.
- **wordsUsed**: string[] - Array of words that have been used in the game.
- **currentWord**: string - The word currently being guessed.
- **score**: { red: number; blue: number; } - Object representing the scores and skips of each team.
- **turn**: Turn | null - Represents the current turn or null if it's not set.

```typescript
interface Game {
    id: string;
    name: string;
    host: string;
    isGameStarted: boolean;
    players: Player[];
    maxUsers: number;
    wordsUsed: string[];
    currentWord: string;
    score: { red: number; blue: number; redSkip: number; blueSkip: number };
    turn: Turn | null;
}
```

---
## WordStatus Enum

### Description
The `WordStatus` enum defines the possible statuses of a word during the game.

### Values
- **GUESSED**: 'guessed' - Indicates the word has been guessed correctly.
- **SIMILAR**: 'similar' - Indicates the word is similar to the guessed word.
- **PLURAL**: 'plural' - Indicates that the word used is the plural version of the word to guess.
- **NOT_GUESSED**: 'notGuessed' - Indicates the word has not been guessed.

```typescript
enum WordStatus {
    GUESSED = 'guessed',
    SIMILAR = 'similar',
    PLURAL = 'plural',
    NOT_GUESSED = 'notGuessed',
}
```
---

## Turn Interface

### Description
The `Turn` interface encapsulates the details of the current turn in the game.

### Properties
- **alreadyDescribed**: string[] - Array of words that have already been described.
- **team**: Team - The team that is currently taking their turn.
- **describerId**: string - User ID of the player describing the word.
- **describerName**: string - Name of the player describing the word.

```typescript
interface Turn {
    alreadyDescribed: string[];
    team: Team;
    describerId: string;
    describerName: string;
}
```
---

## Stats Interface

### Description
The `Stats` interface tracks a player's overall game performance. It is an extension of `InGameStats`

### Properties
- **gamesPlayed**: number - Total number of games played.
- **wins**: number - Total number of wins.
- **loses**: number - Total number of losses.
- **draw**: number - Total number of draws.
- **wordsGuessed**: number - Number of words guessed correctly.
- **wellDescribed**: number - Number of words well described.

```typescript
interface Stats{
    gamesPlayed: number;
    wins: number;
    loses: number;
    draw: number;
    wordsGuessed: number;
    wellDescribed: number;
}
```
---

## InGameStats Interface

### Description
The `InGameStats` interface holds statistics specific to a player's performance in a single game.

### Properties
- **wordsGuessed**: number - Number of words guessed during the game.
- **wellDescribed**: number - Number of words described well during the game.

```typescript
interface InGameStats {
    wordsGuessed: number;
    wellDescribed: number;
}
```
---

## ActiveUser Interface

### Description
The `ActiveUser` interface represents a user currently in a game, holding connection data and game information.

### Properties
- **id**: string - User ID of the active user.
- **socketId**: string (optional) - Socket ID for the user's connection.
- **gameId**: string (optional) - ID of the game the user is currently in.
- **initialJoinTimeout**: NodeJS.Timeout (optional) - Timeout for removing the user from the game if they don’t join.

```typescript
interface ActiveUser {
    id: string;
    socketId?: string;
    gameId?: string;
    initialJoinTimeout?: NodeJS.Timeout;
}
```
---

## Team Enum

### Description
The `Team` enum defines the possible teams in the game.

### Values
- **RED**: 'redTeam' - Represents the red team.
- **BLUE**: 'blueTeam' - Represents the blue team.

```typescript
enum Team {
    RED = 'redTeam',
    BLUE = 'blueTeam',
}
```
---

## ActivePlayer Type

### Description
The `ActivePlayer` type represents a player in the game, including their name and connection status.

### Structure
- **[string, boolean]** - An array where the first element is the player’s name and the second is a flag indicating if they are connected.

```typescript
type ActivePlayer = [string, boolean];
```

## Player Interface

### Description
The `Player` interface holds all relevant data about a player in the game.

### Properties
- **userId**: string - Unique ID of the user.
- **name**: string - Name of the player.
- **team**: Team - The team the player is on.
- **inGameStats**: InGameStats - Statistics specific to the player's performance in the current game.

```typescript
interface Player {
    userId: string;
    name: string;
    team: Team;
    inGameStats: InGameStats;
}
```
---

## Conclusion

These interfaces and types are crucial for managing game data, tracking player statistics, and ensuring smooth gameplay in Alias. Understanding their structure helps in implementing game logic effectively.
