export const MAX_USERS = 6;
export const JOIN_TIMEOUT = 5000;

/**
 * Type for storing game data
 * @property {string} id - game id
 * @property {string} name - game name
 * @property {string} host - user id of the game host
 * @property {boolean} isGameStarted - flag indicating if the game has started
 * @property {string[]} redTeam - array of user ids in the red team
 * @property {string[]} blueTeam - array of user ids in the blue team
 * @property {string[]} noTeam - array of user ids not in any team
 * @property {number} maxUsers - maximum number of users in the game
 */
export interface Game {
  id: string;
  name: string;
  host: string;
  isGameStarted: boolean;
  redTeam: string[];
  blueTeam: string[];
  noTeam: string[];
  maxUsers: number;
}

/**
 * Type representing an active user (already in a game, not in the lobby)
 * @property {string} id - user id
 * @property {string} name - user name
 * @property {string} [socketId] - socket id of the user. Let's us see if user has active connection in game room
 * @property {string} [gameId] - id of the game the user is in
 * @property {NodeJS.Timeout} [initialJoinTimeout] - timeout to remove user from game if they don't join from the lobby (on redirect)
 */
export interface ActiveUser {
  id: string;
  name: string;
  socketId?: string;
  gameId?: string;
  initialJoinTimeout?: NodeJS.Timeout;
}

// export interface Game {
//   id: string;
//   name: string;
//   host: string;
//   isGameStarted: boolean;
//   players: Player[];
//   maxUsers: number;
// }

// export enum Team {
//   RED = 'red',
//   BLUE = 'blue',
//   NO_TEAM = 'noTeam',
// }

// export interface Player {
//   id: string;
//   name: string;
//   team: Team;
// }

export const DUMMY_GAMES: Game[] = [
  {
    id: '1',
    name: 'Game 1',
    host: '1',
    isGameStarted: false,
    redTeam: [],
    blueTeam: [],
    noTeam: ['1', '2', '3', '4'],
    maxUsers: MAX_USERS,
  },
  {
    id: '2',
    name: 'Game 2',
    host: '5',
    isGameStarted: false,
    redTeam: [],
    blueTeam: [],
    noTeam: ['5', '6', '7'],
    maxUsers: MAX_USERS,
  },
];

export const DUMMY_USERS: ActiveUser[] = [
  { id: '1', name: 'User 1', gameId: '1' },
  { id: '2', name: 'User 2', gameId: '1' },
  { id: '3', name: 'User 3', gameId: '1' },
  { id: '4', name: 'User 4', gameId: '1' },
  { id: '5', name: 'User 5', gameId: '2' },
  { id: '6', name: 'User 6', gameId: '2' },
  { id: '7', name: 'User 7', gameId: '2' },
];
