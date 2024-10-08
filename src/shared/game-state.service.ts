import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { GameRoomDto } from 'src/game-room/dto/game-room-dto';
import { GameStartedDto } from 'src/game-room/dto/game-started-dto';
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

  getActiveUserById(userId: string): ActiveUser {
    return this.activeUsers.find((user) => user.id === userId);
  }

  getPlayerById(userId: string, gameId: string): Player {
    const game = this.getGameById(gameId);
    return game.players.find((player) => player.userId === userId);
  }

  removePlayerSocketId(userId: string): void {
    const user = this.getActiveUserById(userId);
    if (user) {
      delete user.socketId;
    }
  }

  isUserActive(userId: string): boolean {
    return this.activeUsers.some((user) => user.id === userId);
  }

  hasUserSocketId(userId: string): boolean {
    const user = this.getActiveUserById(userId);
    return user && user.socketId !== undefined;
  }

  addPlayerSocketId(userId: string, socketId: string): void {
    const user = this.getActiveUserById(userId);
    if (user) {
      user.socketId = socketId;
    }
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

  getPlayersWithSocketsInGame(
    gameId: string,
  ): { socketId: string; team: Team }[] {
    const game = this.getGameById(gameId);
    return game.players
      .filter((player) => this.isUserActive(player.userId))
      .map((player) => ({
        socketId: this.getActiveUserById(player.userId).socketId,
        team: player.team,
      }));
  }

  getAllGames(): Game[] {
    return [...this.games];
  }

  getGameById(gameId: string): Game {
    return this.games.find((game) => game.id === gameId);
  }

  isGameEmpty(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.players.length === 0;
  }

  isGameFull(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.players.length >= game.maxUsers;
  }

  isGameStarted(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.isGameStarted;
  }

  getTeamOfPlayer(userId: string, gameId: string): Team {
    const game = this.getGameById(gameId);
    const player = game.players.find((player) => player.userId === userId);
    return player ? player.team : Team.NO_TEAM;
  }

  gameExists(gameId: string): boolean {
    return this.games.some((game) => game.id === gameId);
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
      wordsUsed: [],
      currentWord: '',
      score: [0, 0],
      turn: null,
    };
    this.games.push(newGame);

    this.createUser(userId, newGame.id, timeout, timeoutCb);

    return newGame.id;
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

  getSerializedGameStarted(gameId: string): GameStartedDto {
    const game = this.getGameById(gameId);

    return plainToClass(GameStartedDto, {
      id: game.id,
      name: game.name,
      host: game.host,
      isGameStarted: game.isGameStarted,
      redTeam: game.players
        .filter((player) => player.team === Team.RED)
        .map((player) => [player.name, this.hasUserSocketId(player.userId)]),
      blueTeam: game.players
        .filter((player) => player.team === Team.BLUE)
        .map((player) => [player.name, this.hasUserSocketId(player.userId)]),
      turn: game.turn
        ? {
            alreadyDiscribe: game.turn.alreadyDiscribe,
            team: game.turn.team,
            describerId: game.turn.describerId,
            describerName: game.turn.describerName,
          }
        : null,
      currentWord: game.currentWord,
      score: game.score,
    });
  }

  movePlayerToTeam(userId: string, gameId: string, team: Team): void {
    const game = this.getGameById(gameId);
    const player = game.players.find((player) => player.userId === userId);
    if (player) {
      player.team = team;
    }
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

  setGameStarted(gameId: string): void {
    const game = this.getGameById(gameId);
    game.isGameStarted = true;
  }

  moveHostToNextUser(gameId: string): void {
    const game = this.getGameById(gameId);
    game.host = game.players[0].userId;
  }

  removePlayerFromGame(userId: string, gameId: string): void {
    const game = this.getGameById(gameId);
    game.players = game.players.filter((player) => player.userId !== userId);
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

  saveCurrentState(game: Game) {
    try {
      // Save or update logic
      const existingGameIndex = this.games.findIndex((g) => g.id === game.id);
      if (existingGameIndex !== -1) {
        this.games[existingGameIndex] = game; // Update existing game state
      } else {
        this.games.push(game); // Save new game state
      }
    } catch (error) {
      console.error('Error details:', error);
      throw new Error('Error saving the current game state');
    }
  }

  endGame(gameId: string) {
    // getGameById
    // lo guarda en la base de datos
    // Elimina a los active players del juego
    // Lo elimina del array
  }
}
