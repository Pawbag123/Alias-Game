export const MAX_USERS = 4;

export enum UserTeam {
  RED = 'RED',
  BLUE = 'BLUE',
  NONE = 'NONE',
}

export interface InGameUser {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  team: UserTeam;
}

export interface Room {
  id: string;
  name: string;
  users: InGameUser[];
  maxUsers: number;
  isGameStarted: boolean;
}
