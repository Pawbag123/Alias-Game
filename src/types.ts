export const MAX_USERS = 6;
export const MAX_TURNS = 4;
export const TURN_TIME = 45;
export const JOIN_TIMEOUT = 5000;
export const CLIENT_PORT = 3000;
export const DESCRIBER_LEVENSHTEIN_THRESHOLD = 2;
export const GUESSER_LEVENSHTEIN_THRESHOLD = 2;
export const MIN_LEVENSHTEIN_WORD_LENGTH = 3;

export const WORDS_TO_GUESS = [
  // Fruits
  'apple', 'banana', 'grape', 'orange', 'peach', 'lemon', 'cherry', 'mango', 'plum', 'melon', 'kiwi', 'strawberry', 'blueberry', 'pineapple', 'watermelon', 'pear', 'papaya', 'coconut',
  // Animals
  'elephant', 'giraffe', 'zebra', 'tiger', 'lion', 'panda', 'whale', 'eagle', 'falcon', 'rabbit', 'dog', 'cat', 'mouse', 'horse', 'cow', 'sheep', 'chicken', 'duck', 'frog', 'snake', 'owl',
  // Household Items
  'house', 'garden', 'window', 'door', 'kitchen', 'bedroom', 'roof', 'fence', 'garage', 'chimney', 'table', 'chair', 'couch', 'lamp', 'cup', 'plate', 'fork', 'knife', 'spoon', 'mirror', 'clock',
  // Technology
  'laptop', 'keyboard', 'mouse', 'screen', 'printer', 'tablet', 'phone', 'camera', 'speaker', 'headphones', 'charger', 'router', 'television', 'remote', 'monitor', 'smartphone', 'battery', 'USB', 'bluetooth',
  // Vehicles
  'car', 'bicycle', 'bus', 'train', 'airplane', 'helicopter', 'submarine', 'motorcycle', 'skateboard', 'truck', 'boat', 'scooter', 'van', 'trailer', 'ship', 'taxi', 'hoverboard',
  // Music Instruments
  'guitar', 'piano', 'drums', 'trumpet', 'flute', 'violin', 'saxophone', 'tambourine', 'cello', 'harp', 'clarinet', 'accordion', 'trombone', 'banjo', 'xylophone', 'harmonica', 'keyboard',
  // Nature
  'mountain', 'river', 'forest', 'beach', 'desert', 'valley', 'volcano', 'lake', 'island', 'cave', 'hill', 'waterfall', 'field', 'ocean', 'jungle', 'prairie', 'meadow', 'reef', 'savannah',
  // Literature
  'book', 'magazine', 'newspaper', 'novel', 'dictionary', 'encyclopedia', 'poem', 'journal', 'biography', 'atlas', 'comic', 'manual', 'guide', 'story', 'fiction', 'nonfiction', 'essay',
  // Clothing
  'shirt', 'pants', 'dress', 'jacket', 'hat', 'scarf', 'shoes', 'socks', 'gloves', 'belt', 'skirt', 'tie', 'sweater', 'blouse', 'coat', 'jeans', 'shorts', 'sandals', 'boots',
  // Sports
  'soccer', 'tennis', 'basketball', 'baseball', 'golf', 'swimming', 'cycling', 'running', 'skiing', 'surfing', 'hockey', 'volleyball', 'boxing', 'skating', 'archery', 'climbing', 'diving',
  // Food
  'bread', 'butter', 'cheese', 'milk', 'egg', 'yogurt', 'chocolate', 'honey', 'sugar', 'salt', 'pepper', 'pizza', 'burger', 'sandwich', 'pasta', 'rice', 'salad', 'soup', 'cake', 'cookie', 'pie', 'coffee', 'tea',
  // Colors
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'cyan', 'magenta', 'gold', 'silver', 'turquoise', 'beige', 'maroon', 'navy', 'teal',
  ];

/**
 * Type for storing game data
 * @property {string} id - game id
 * @property {string} name - game name
 * @property {string} host - user id of the game host
 * @property {boolean} isGameStarted - flag indicating if the game has started
 * @property {Player} players - array of players in the game
 * @property {number} maxUsers - maximum number of users in the game
 */
export interface Game {
  id: string;
  name: string;
  host: string;
  isGameStarted: boolean;
  players: Player[];
  wordsUsed: string[];
  currentWord: string;
  settings: Settings;
  score: {
    red: number;
    blue: number;
    redSkip: number;
    blueSkip: number;
  };
  turn: Turn | null;
}

export enum WordStatus {
  GUESSED = 'guessed',
  SIMILAR = 'similar',
  PLURAL = 'plural',
  NOT_GUESSED = 'notGuessed',
}

export interface Settings {
  maxPlayers: number,
  rounds: number,
  time: number
}

export enum WsExceptionType {
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
  Unknown = 'Unknown',
  Conflict = 'Conflict',
  InternalServerError = 'InternalServerError',
}

export interface Turn {
  alreadyDescribed: string[];
  team: Team;
  describerId: string;
  describerName: string;
}

export interface Stats extends InGameStats {
  gamesPlayed: number;
  wins: number;
  loses: number;
  draw: number;
}

export interface InGameStats {
  wordsGuessed: number;
  wellDescribed: number;
}

/**
 * Type representing an active user (already in a game, not in the lobby)
 * Holds the data about his connection and game he is in
 * @property {string} id - user id
 * @property {string} name - user name
 * @property {string} [socketId] - socket id of the user. Let's us see if user has active connection in game room
 * @property {string} [gameId] - id of the game the user is in
 * @property {NodeJS.Timeout} [initialJoinTimeout] - timeout to remove user from game if they don't join from the lobby (on redirect)
 */
export interface ActiveUser {
  id: string;
  socketId?: string;
  gameId?: string;
  initialJoinTimeout?: NodeJS.Timeout;
}

export enum Team {
  RED = 'redTeam',
  BLUE = 'blueTeam',
}

/**
 * Type representing a player sent to frontend, with his name and flag whether is he connected
 */
export type ActivePlayer = [string, boolean];

/**
 * Type representing a player in the game, will hold all the data about the player
 * for example his score, chat and so on
 * @property {string} userId - user id
 * @property {string} name - user name
 * @property {Team} team - team the player is on
 */
export interface Player {
  userId: string;
  name: string;
  team: Team;
  inGameStats: InGameStats;
}
