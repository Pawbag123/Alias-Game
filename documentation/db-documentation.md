# Alias Game DB

# Content


  - [Structure](#structure)
  - [Schemas](#schemas)
    -  [User](#user)
    -  [Chat](#chat)
    -  [Games](#games)

# Structure

This document provides a detailed overview of the database structure used in the project.

# Schemas

## User
The User schema defines the structure of user data for the Alias Game project. It includes information such as the username, password, refresh token, and game-related statistics.

### Fields

#### 1. username
- `Type:` String
- `Required:` Yes
- `Unique:` Yes
- `Description:` The unique username used by the user to log into the system.

#### 2. password
- `Type:` String
- `Required:` Yes
- `Description:` The hashed password of the user for authentication.

#### 3. refreshToken
- `Type:` String
- `Required:` No
- `Description:` The refresh token used for generating new authentication tokens after login sessions expire.

#### 4. stats
- `Type:` Object
- `Required:` Yes (default values provided)
- `Description:` A nested object containing statistics related to the user's game performance.

#### Stats Object Fields:

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `gamesPlayed` | Number | The total number of games the user has played. | Yes |
| `wins` | Number | The number of games the user has won. | Yes |
| `loses` | Number | The number of games the user has lost. | Yes |
| `draw` | Number | The number of games that ended in a draw. | Yes |
| `wordsGuessed	` | Number | The number of words the user has guessed. | Ye |
| `wellDescribed` | Number | The number of times the user's descriptions were rated well. | Yes |

<br>

## Chat
The Chat schema defines the structure of chat data for the Alias Game project. It stores messages exchanged during a game, linking the chat to a specific game and detailing the users involved in each message.

### Fields

#### 1. gameId
- `Type:` String
- `Required:` Yes
- `Description:` The unique ID of the game this chat belongs to. This is used to associate the chat with a specific game instance.

#### 2. messages
- `Type:` Array
- `Description:` An array of message objects. Each object contains the details of a message sent in the chat.
#### Message Object Fields:

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `_id` | ObjectId (auto-generated) | Unique identifier for the chat. | Yes |
| `userIdMongo` | ObjectId (references User) | The MongoDB ObjectId of the user sending the message. | No |
| `userId` | String | The ID of the user sending the message (custom identifier). | Yes |
| `userName` | String | The display name of the user sending the message. | Yes |
| `content` | String | The content of the message sent by the user. | Yes |
| `timestamp` | Date (default: current time) | The time when the message was sent. | No |


<br>

## Games
The Games schema tracks data related to individual game instances, including player information, team scores, and words used during the game.

### Fields

#### 1. gameId
- `Type:` String
- `Required:` Yes
- `Description:` A unique identifier for each game instance.

#### 2. host
- `Type:` String
- `Required:` Yes
- `Description:` The user who initiated and hosts the game.

#### 3. players
- `Type:` Array
- `Description:` An array of player objects containing details about each participant in the game.

#### Player Object Fields:

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `userId` | String | The unique identifier for the player (custom ID). | Yes |
| `name` | String | The player's name. | Yes |
| `team` | String | The team the player belongs to (e.g., "red" or "blue"). | Yes |
| `inGameStats` | Object | An object tracking the player's in-game performance. | Yes |

#### inGameStats Object Fields:

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `wordsGuessed` | Number | The number of words the player has guessed. | Yes |
| `wellDescribed` | Number | The number of times the player's descriptions were rated well. | Yes |

<br>



