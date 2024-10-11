# Node.js-Based Game "Alias"

## Table of Contents

### General
- [Game Description](../README.md#game-description)
- [Rules](../README.md#rules)
- [System Requirements](../README.md#system-requirements)
- [Setup and Installation](../README.md#setup-and-installation)
- [Troubleshooting](../README.md#troubleshooting)

### Technical
- Project Structure
    - [Files & Folders](project-structure/files-and-folders.md#directory-structure)
    - [Modules](project-structure/core-modules.md#core-modules)
- Data Architecture
    - [Data Base Schemas](data-architecture/database-schemas.md#structure)
    - [Interfaces](data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](data-architecture/dtos#dtos)
- APIs
    - [Auth](apis/auth.md#auth-controller)
    - [Socket Events](apis/socket-events#socket-events-documentation)
- Guides
    - [Testing](guides/testing.md#running-tests-in-nestjs-with-jest)
    - [Deployment](guides/deployment.md#deploying-a-nestjs-application-to-heroku)

### Additional Information
- [Future Enhancements](#future-enhancements)
- [FAQ](FAQ.md)

# Future Enhancements


### Customizable Game Settings

- `Description`: Allow users or hosts to configure game settings, such as the number of rounds and the duration of each round before starting the game.
- `Details`: 
  - **Select Number of Rounds**: Users can choose how many rounds a game will last, providing flexibility for shorter or longer games.
  - **Set Time Per Round**: Hosts can adjust the time limit for each round, enabling faster or more relaxed gameplay.
- `Benefits`: Enhances user control over game parameters, making the game more flexible for different types of players.

### Inappropriate Language Detection

- `Description`: Implement a system that detects and flags inappropriate or offensive words used in the chat during the game.
- `Details`:
  - **Language Filter**: Scan chat messages for offensive words and warn or censor users automatically.
  - **User Ban System:**: Repeated violations trigger a ban for the user from participating in the current game or future games, based on the severity.
- `Benefits`: 
  - Helps maintain a positive and respectful environment during gameplay.
  - Automatically enforces rules on language use, reducing the need for manual moderation.

### Integration with Social Media

- `Description`: Allow players to share game results or achievements directly to their social media platforms.
- `Details`:
  - **Social Media Sharing**: Enable players to post their game highlights, wins, and notable moments to platforms like Twitter, Facebook, or Instagram.
- `Benefits`: 
  - Increases visibility for the game and encourages community building.
  - Engages players beyond the game itself, allowing them to celebrate and share their successes.