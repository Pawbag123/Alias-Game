export const MAX_USERS = 6;
export const JOIN_TIMEOUT = 5000;

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

export interface ActiveUser {
  id: string;
  name: string;
  socketId?: string;
  gameId?: string;
  // timeout to remove user from game if they don't join from lobby
  // in certain amount of time
  initialJoinTimeout?: NodeJS.Timeout;
}

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
