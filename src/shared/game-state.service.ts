import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { GameRoomDto } from 'src/game-room/dto/game-room-dto';
import { InLobbyGameDto } from 'src/lobby/dto/in-lobby-game-dto';
import { ActiveUser, Game, Player, Team } from 'src/lobby/types';

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

  movePlayerToTeam(userId: string, gameId: string, team: Team): void {
    const game = this.getGameById(gameId);
    const player = game.players.find((player) => player.userId === userId);
    if (player) {
      player.team = team;
    }
  }

  isGameFull(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.players.length >= game.maxUsers;
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
    const newPlayer: Player = {
      userId,
      name: userName,
      team: Team.NO_TEAM,
    };

    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      name: gameName,
      host: userId,
      isGameStarted: false,
      players: [newPlayer],
      maxUsers: maxUsers,
    };
    this.games.push(newGame);

    this.createUser(userId, newGame.id, timeout, timeoutCb);

    return newGame.id;
  }

  isUserAllowedInGame(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    const playerExists = game.players.some(
      (player) => player.userId === userId,
    );
    return playerExists;
  }

  isGameHost(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.host === userId;
  }

  moveHostToNextUser(gameId: string): void {
    const game = this.getGameById(gameId);
    game.host = game.players[0].userId;
  }

  isGameEmpty(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.players.length === 0;
  }

  removePlayerFromGame(userId: string, gameId: string): void {
    const game = this.getGameById(gameId);
    game.players = game.players.filter((player) => player.userId !== userId);
  }

  removeActiveUser(userId: string): void {
    this.activeUsers = this.activeUsers.filter((user) => user.id !== userId);
  }

  createUser(
    userId: string,
    gameId: string,
    timeout: number,
    timeoutCb: () => void,
  ): void {
    this.activeUsers.push({
      id: userId,
      gameId: gameId,
      //   initialJoinTimeout: setTimeout(() => {
      //     timeoutCb();
      //   }, timeout),
    });
  }

  createJoinUser(
    userId: string,
    gameId: string,
    timeout: number,
    timeoutCb: () => void,
  ): void {
    this.activeUsers.push({
      id: userId,
      gameId: gameId,
      initialJoinTimeout: setTimeout(() => {
        this.handleUserJoinTimeout(userId, gameId, timeoutCb);
      }, timeout),
    });
  }

  addUserToGame(userId: string, userName: string, gameId: string): void {
    const game = this.getGameById(gameId);
    const newPlayer: Player = {
      userId,
      name: userName,
      team: Team.NO_TEAM,
    };
    game.players.push(newPlayer);
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
    this.removePlayerFromGame(userId, gameId);

    emitGamesUpdated();
  }

  getSerializedGames(): InLobbyGameDto[] {
    return this.games.map((game) =>
      plainToClass(InLobbyGameDto, {
        id: game.id,
        name: game.name,
        players: game.players.length,
        maxPlayers: game.maxUsers,
        started: game.isGameStarted,
      }),
    );
  }

  getSerializedGameRoom(gameId: string): GameRoomDto {
    const game = this.getGameById(gameId);

    return plainToClass(GameRoomDto, {
      id: game.id,
      name: game.name,
      host: game.host,
      isGameStarted: game.isGameStarted,
      redTeam: game.players
        .filter((player) => player.team === Team.RED)
        .map((player) => player.name),
      blueTeam: game.players
        .filter((player) => player.team === Team.BLUE)
        .map((player) => player.name),
      noTeam: game.players
        .filter((player) => player.team === Team.NO_TEAM)
        .map((player) => player.name),
    });
  }
}
