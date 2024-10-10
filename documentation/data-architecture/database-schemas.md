# MongoDB Schemas Documentation

## Overview

This document outlines the key schemas used in the application, detailing their properties and purposes. These schemas are essential for managing game data, user accounts, and chat functionality.

## Table of Contents

1. [Games Schema](#games-schema)
2. [Chat Schema](#chat-schema)
3. [User Schema](#user-schema)

---

## Games Schema

### Description
The Games schema represents game sessions, including participants and their statistics.

### Properties
- **gameId**: string - Unique identifier for the game session.
- **host**: string - User ID of the game host.
- **players**: Array - List of players in the game, each including their statistics.
  - **userId**: string - Unique identifier for the user.
  - **name**: string - Name of the player.
  - **team**: string - Team the player belongs to.
  - **inGameStats**: Object - In-game statistics for the player.
    - **wordsGuessed**: number - Total words guessed by the player.
    - **wellDescribed**: number - Total well-described words by the player.
- **score**: Object - Represents the scores of each team.
  - **red**: number - Score for the red team.
  - **blue**: number - Score for the blue team.
- **wordsUsed**: Array - List of words that have been used in the game.

Class representation:

class Games {
    gameId: string;
    host: string;
    players: {
        userId: string;
        name: string;
        team: string;
        inGameStats: {
            wordsGuessed: number;
            wellDescribed: number;
        };
    }[];
    score: { red: number; blue: number };
    wordsUsed: string[];
}

---

## Chat Schema

### Description
The Chat schema represents chat messages exchanged during a game session.

### Properties
- **gameId**: string - Unique identifier for the game associated with the chat.
- **messages**: Array - List of messages exchanged in the chat.
  - **_id**: ObjectId - Unique identifier for the message.
  - **userIdMongo**: string - MongoDB ObjectId of the user sending the message.
  - **userId**: string - Unique identifier for the user sending the message.
  - **userName**: string - Name of the user sending the message.
  - **content**: string - Content of the message.
  - **timestamp**: Date - Timestamp when the message was sent.

Class representation:

class Chat {
    gameId: string;
    messages: {
        _id: mongoose.Schema.Types.ObjectId;
        userIdMongo: string;
        userId: string;
        userName: string;
        content: string;
        timestamp: Date;
    }[];
}

---

## User Schema

### Description
The User schema represents user accounts in the application.

### Properties
- **username**: string - Unique username for the user.
- **password**: string - Password for user authentication.
- **refreshToken**: string (optional) - Token used for refreshing sessions.
- **stats**: Object - Statistics tracking the user's overall game performance.
  - **gamesPlayed**: number - Total number of games played.
  - **wins**: number - Total number of wins.
  - **loses**: number - Total number of losses.
  - **draw**: number - Total number of draws.
  - **wordsGuessed**: number - Total words guessed by the user.
  - **wellDescribed**: number - Total well-described words by the user.

Class representation:

class User {
    username: string;
    password: string;
    refreshToken?: string;
    stats: {
        gamesPlayed: number;
        wins: number;
        loses: number;
        draw: number;
        wordsGuessed: number;
        wellDescribed: number;
    };
}

---

## Conclusion

These schemas are crucial for managing game data, user accounts, and chat functionality in the application. Understanding their structure helps in implementing the application's logic effectively.
