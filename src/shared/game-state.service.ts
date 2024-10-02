import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { GameRoomDto } from 'src/game-room/dto/game-room-dto';
import { InLobbyGameDto } from 'src/lobby/dto/in-lobby-game-dto';
import { ActiveUser, DUMMY_GAMES, DUMMY_USERS, Game } from 'src/lobby/types';

/**
 * Service that handles the state of the game,
 * so it stores all real-time data about the games and users
 */
@Injectable()
export class GameStateService {
  private games: Game[] = [];
  private activeUsers: ActiveUser[] = [];

  getAllGames(): Game[] {
    return [...this.games];
  }

  getGameById(gameId: string): Game {
    return this.games.find((game) => game.id === gameId);
  }

  getActiveUserById(userId: string): ActiveUser {
    return this.activeUsers.find((user) => user.id === userId);
  }

  isUserActive(userId: string): boolean {
    return this.activeUsers.some((user) => user.id === userId);
  }

  isGameFull(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return (
      game.redTeam.length + game.blueTeam.length + game.noTeam.length >=
      game.maxUsers
    );
  }

  isGameStarted(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.isGameStarted;
  }

  createGame(
    gameName: string,
    userId: string,
    userName: string,
    maxUsers: number,
    timeout: number,
    timeoutCb: () => void,
  ): string {
    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      name: gameName,
      host: userId,
      isGameStarted: false,
      redTeam: [],
      blueTeam: [],
      noTeam: [userId],
      maxUsers: maxUsers,
    };
    this.games.push(newGame);

    this.createUser(userId, userName, newGame.id, timeout, timeoutCb);

    // const newActiveUser: ActiveUser = {
    //   id: userId,
    //   name: 'userName',
    //   gameId: newGame.id,
    // };
    // this.activeUsers.push(newActiveUser);

    return newGame.id;
  }

  isUserAllowedInGame(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    return (
      game.redTeam.includes(userId) ||
      game.blueTeam.includes(userId) ||
      game.noTeam.includes(userId)
    );
  }

  isGameHost(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.host === userId;
  }

  moveHostToNextUser(gameId: string): void {
    const game = this.getGameById(gameId);
    game.host = game.redTeam[0] || game.blueTeam[0] || game.noTeam[0];
  }

  isGameEmpty(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return (
      game.redTeam.length + game.blueTeam.length + game.noTeam.length === 0
    );
  }

  removeUserFromGame(userId: string, gameId: string): void {
    const game = this.getGameById(gameId);
    game.redTeam = game.redTeam.filter((id) => id !== userId);
    game.blueTeam = game.blueTeam.filter((id) => id !== userId);
    game.noTeam = game.noTeam.filter((id) => id !== userId);
  }

  removeActiveUser(userId: string): void {
    this.activeUsers = this.activeUsers.filter((user) => user.id !== userId);
  }

  createUser(
    userId: string,
    userName: string,
    gameId: string,
    timeout: number,
    timeoutCb: () => void,
  ): void {
    this.activeUsers.push({
      id: userId,
      name: userName,
      gameId: gameId,
      //   initialJoinTimeout: setTimeout(() => {
      //     timeoutCb();
      //   }, timeout),
    });
  }

  createJoinUser(
    userId: string,
    userName: string,
    gameId: string,
    timeout: number,
    timeoutCb: () => void,
  ): void {
    this.activeUsers.push({
      id: userId,
      name: userName,
      gameId: gameId,
      initialJoinTimeout: setTimeout(() => {
        this.handleUserJoinTimeout(userId, gameId, timeoutCb);
      }, timeout),
    });
  }

  addUserToGame(userId: string, gameId: string): void {
    const game = this.getGameById(gameId);
    game.noTeam.push(userId);
  }

  displayGames(): void {
    console.log('Games:', this.games);
  }

  displayActiveUsers(): void {
    console.log('Active users:', this.activeUsers);
  }

  removeGameRoom(gameId: string): void {
    this.games = this.games.filter((game) => game.id !== gameId);
    this.activeUsers = this.activeUsers.filter(
      (user) => user.gameId !== gameId,
    );
  }

  findUserBySocketId(socketId: string): ActiveUser {
    console.log('users:', this.activeUsers);
    return this.activeUsers.find((user) => user.socketId === socketId);
  }

  gameExists(gameId: string): boolean {
    return this.games.some((game) => game.id === gameId);
  }

  /**
   * Function that is called when an user doesn't join a game from the lobby
   * after creation of a game in a certain amount of time
   * @param userId - id of the user that didn't join
   * @param gameId - id of the game that the user didn't join
   * @param emitGamesUpdated - function to emit updated games to all clients
   */
  handleUserCreateGameTimeout(
    userId: string,
    gameId: string,
    emitGamesUpdated: () => void,
  ): void {
    // this.activeUsers = this.activeUsers.filter(
    //   (user) => user.id !== userId && user.gameId !== gameId,
    // );
    // const game = this.games.find((game) => game.id === gameId);
    // game.noTeam = game.noTeam.filter((id) => id !== userId);

    emitGamesUpdated();
  }

  //TODO: implement handlers for edge cases
  /**
   * Function that is called when an user doesn't join a game from the lobby in a certain amount of time
   * it removes the user from the game and the active users array
   * and then emits passed function to emit games updated to all clients
   * @param userId - id of the user that didn't join
   * @param gameId - id of the game that the user didn't join
   * @param emitGamesUpdated - function to emit updated games to all clients
   */
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
}
