import { Injectable } from '@nestjs/common';
import {
  ActiveUser,
  DUMMY_GAMES,
  DUMMY_USERS,
  Game,
  JOIN_TIMEOUT,
  MAX_USERS,
} from './types';
import { InLobbyGameDto } from './dto/in-lobby-game-dto';
import { plainToClass } from 'class-transformer';
import { CreateGameDto } from './dto/create-game-dto';
import { MAX } from 'class-validator';
import { JoinGameDto } from './dto/join-game-dto';
import { GameRoomDto } from 'src/game-room/dto/game-room-dto';

@Injectable()
export class LobbyService {
  private games: Game[] = DUMMY_GAMES;
  private activeUsers: ActiveUser[] = DUMMY_USERS;

  //TODO: add validation/error throwing
  createGame({ gameName, userId, userName }: CreateGameDto): string {
    if (this.activeUsers.find((user) => user.id === userId)) {
      throw new Error('User already in game');
    }

    //* Create a new game
    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      name: gameName,
      host: userId,
      isGameStarted: false,
      redTeam: [],
      blueTeam: [],
      noTeam: [userId],
      maxUsers: MAX_USERS,
    };
    this.games.push(newGame);

    //* Add the user to the game
    const newActiveUser: ActiveUser = {
      id: userId,
      name: userName,
      gameId: newGame.id,
    };
    this.activeUsers.push(newActiveUser);

    //TODO: implement for creation
    //* Set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
    newActiveUser.initialJoinTimeout = setTimeout(() => {
      // this.handleUserJoinTimeout();
    }, JOIN_TIMEOUT);

    return newGame.id;
  }

  joinGame(
    { gameId, userId, userName }: JoinGameDto,
    emitGamesUpdated: () => void,
  ): void {
    if (this.activeUsers.find((user) => user.id === userId)) {
      throw new Error('User already in game');
    }

    //* Find the game
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    //* Add the user to the game
    const newActiveUser: ActiveUser = {
      id: userId,
      name: userName,
      gameId: gameId,
    };
    this.activeUsers.push(newActiveUser);
    console.log('User joined game:', newActiveUser);
    game.noTeam.push(userId);

    newActiveUser.initialJoinTimeout = setTimeout(() => {
      this.handleUserJoinTimeout(userId, gameId, emitGamesUpdated);
    }, JOIN_TIMEOUT);
  }

  //TODO: implement handlers for edge cases
  handleUserJoinTimeout(
    userId: string,
    gameId: string,
    emitGamesUpdated: () => void,
  ): void {
    this.activeUsers = this.activeUsers.filter(
      (user) => user.id !== userId && user.gameId !== gameId,
    );
    const game = this.games.find((game) => game.id === gameId);
    game.noTeam = game.noTeam.filter((id) => id !== userId);

    emitGamesUpdated();
  }

  getAllGames(): Game[] {
    return this.games;
  }

  getGameById(gameId: string): Game {
    return this.games.find((game) => game.id === gameId);
  }

  getActiveUserById(userId: string): ActiveUser {
    return this.activeUsers.find((user) => user.id === userId);
  }

  //* Logic for transitioning a game from the lobby to the game room
  addPlayerToGame(gameId: string, userId: string, socketId: string): void {
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (
      !(
        game.redTeam.includes(userId) ||
        game.blueTeam.includes(userId) ||
        game.noTeam.includes(userId)
      )
    ) {
      throw new Error('User not allowed to join game');
    }

    const user = this.activeUsers.find((user) => user.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.socketId) {
      throw new Error('User already in game');
    }

    if (user.gameId !== gameId) {
      throw new Error('User not added to this game');
    }

    //* Clear the timeout for removing the user from the game
    clearTimeout(user.initialJoinTimeout);
    delete user.initialJoinTimeout;

    //* Add current socket ID to user
    user.socketId = socketId;
  }

  displayGames(): void {
    console.log('Games:', this.games);
  }

  displayActiveUsers(): void {
    console.log('Active users:', this.activeUsers);
  }

  removePlayerFromGame(gameId: string, userId: string): void {
    console.log('in remove');
    this.displayGames();
    this.displayActiveUsers();
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const user = this.activeUsers.find((user) => user.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.gameId !== gameId) {
      throw new Error('User not in this game');
    }

    //* Remove user from game
    game.redTeam = game.redTeam.filter((id) => id !== userId);
    game.blueTeam = game.blueTeam.filter((id) => id !== userId);
    game.noTeam = game.noTeam.filter((id) => id !== userId);

    this.activeUsers = this.activeUsers.filter((user) => user.id !== userId);

    if (
      game.host === userId &&
      game.redTeam.length + game.blueTeam.length + game.noTeam.length > 0
    ) {
      game.host = game.redTeam[0] || game.blueTeam[0] || game.noTeam[0];
    } else if (
      game.redTeam.length + game.blueTeam.length + game.noTeam.length ===
      0
    ) {
      this.removeGameRoom(gameId);
    }

    //* Remove user from active users
  }

  removeGameRoom(gameId: string): void {
    this.games = this.games.filter((game) => game.id !== gameId);
    this.activeUsers = this.activeUsers.filter(
      (user) => user.gameId !== gameId,
    );
  }

  joinRedTeam(gameId: string, userId: string): void {
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (
      !(
        game.redTeam.includes(userId) ||
        game.blueTeam.includes(userId) ||
        game.noTeam.includes(userId)
      )
    ) {
      throw new Error('User not allowed to join game');
    }

    if (game.noTeam.includes(userId)) {
      game.noTeam = game.noTeam.filter((id) => id !== userId);
      game.redTeam.push(userId);
    } else if (game.blueTeam.includes(userId)) {
      game.blueTeam = game.blueTeam.filter((id) => id !== userId);
      game.redTeam.push(userId);
    }
  }

  joinBlueTeam(gameId: string, userId: string): void {
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (
      !(
        game.redTeam.includes(userId) ||
        game.blueTeam.includes(userId) ||
        game.noTeam.includes(userId)
      )
    ) {
      throw new Error('User not allowed to join game');
    }

    if (game.noTeam.includes(userId)) {
      game.noTeam = game.noTeam.filter((id) => id !== userId);
      game.blueTeam.push(userId);
    } else if (game.redTeam.includes(userId)) {
      game.redTeam = game.redTeam.filter((id) => id !== userId);
      game.blueTeam.push(userId);
    }
  }

  findUserBySocketId(socketId: string): ActiveUser {
    console.log('users:', this.activeUsers);
    return this.activeUsers.find((user) => user.socketId === socketId);
  }

  gameExists(gameId: string): boolean {
    return this.games.some((game) => game.id === gameId);
  }

  getSerializedGameRoom(gameId: string): GameRoomDto {
    const game = this.getGameById(gameId);

    let redTeamNames, blueTeamNames, noTeamNames;

    if (game.redTeam) {
      redTeamNames = game.redTeam.map((userId) => {
        const user = this.getActiveUserById(userId);
        return user ? user.name : 'Unknown';
      });
    } else {
      redTeamNames = [];
    }

    if (game.blueTeam) {
      blueTeamNames = game.blueTeam.map((userId) => {
        const user = this.getActiveUserById(userId);
        return user ? user.name : 'Unknown';
      });
    } else {
      blueTeamNames = [];
    }

    if (game.noTeam) {
      noTeamNames = game.noTeam.map((userId) => {
        const user = this.getActiveUserById(userId);
        return user ? user.name : 'Unknown';
      });
    } else {
      noTeamNames = [];
    }

    return plainToClass(GameRoomDto, {
      id: game.id,
      name: game.name,
      host: game.host,
      isGameStarted: game.isGameStarted,
      redTeam: redTeamNames,
      blueTeam: blueTeamNames,
      noTeam: noTeamNames,
    });
  }

  getSerializedGames(): InLobbyGameDto[] {
    return this.games.map((game) =>
      plainToClass(InLobbyGameDto, {
        id: game.id,
        name: game.name,
        players:
          game.redTeam.length + game.blueTeam.length + game.noTeam.length,
        maxPlayers: game.maxUsers,
        started: game.isGameStarted,
      }),
    );
  }
}
