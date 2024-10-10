import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { use } from 'passport';
import { User } from 'src/auth/schemas/user.schema';

import { GameRoomDto } from 'src/game-room/dto/game-room-dto';
import { GameStartedDto } from 'src/game-room/dto/game-started-dto';
import { Games } from 'src/game-room/schema/game.schema';
import { InLobbyGameDto } from 'src/lobby/dto/in-lobby-game-dto';
import { ActiveUser, Game, Player, Team } from 'src/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service that handles the state of the game,
 * so it stores all real-time data about the games and users
 */
@Injectable()
export class GameStateService {
  private readonly logger = new Logger(GameStateService.name);

  private games: Game[] = [];
  private activeUsers: ActiveUser[] = [];

  constructor(
    @InjectModel(Games.name) private readonly GamesModel: Model<Games>,
    @InjectModel(User.name) private readonly userModel: Model<User>, // Inject DbGame model
  ) {}

  getActiveUserById(userId: string): ActiveUser {
    return this.activeUsers.find((user) => user.id === userId);
  }

  private getPlayerById(userId: string, gameId: string): Player {
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

  private hasUserSocketId(userId: string): boolean {
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
    timeoutCb: (gameId: string) => void,
  ): void {
    this.activeUsers.push({
      id: userId,
      gameId: gameId,
      initialJoinTimeout: setTimeout(() => {
        this.handleUserCreateGameTimeout(userId, gameId, timeoutCb);
      }, timeout),
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

  getGameById(gameId: string): Game {
    return this.games.find((game) => game.id === gameId);
  }

  checkIfGameHasTooFewPlayers(gameId: string): boolean {
    const game = this.getGameById(gameId);
    const redTeamPlayers = game.players.filter(
      (player) => player.team === Team.RED,
    );
    const blueTeamPlayers = game.players.filter(
      (player) => player.team === Team.BLUE,
    );
    return redTeamPlayers.length < 2 || blueTeamPlayers.length < 2;
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

  gameExists(gameId: string): boolean {
    return this.games.some((game) => game.id === gameId);
  }

  getGameOfUser(userId: string): string | undefined {
    const user = this.activeUsers.find((user) => user.id === userId);
    if (user && user.gameId && !user.socketId) {
      return user.gameId;
    }
    return undefined;
  }

  createGame(
    gameName: string,
    userId: string,
    userName: string,
    maxUsers: number,
    timeout: number,
    timeoutCb: (gameId?: string) => void,
  ): string {
    const newPlayer: Player = {
      userId,
      name: userName,
      team: Team.RED,
      inGameStats: {
        wordsGuessed: 0,
        wellDescribed: 0,
      },
    };

    const newGame: Game = {
      id: uuidv4(),
      name: gameName,
      host: userId,
      isGameStarted: false,
      players: [newPlayer],
      maxUsers: maxUsers,
      wordsUsed: [],
      currentWord: '',
      score: {
        red: 0,
        blue: 0,
      },
      turn: null,
    };
    this.games.push(newGame);

    this.createUser(userId, newGame.id, timeout, timeoutCb);

    this.logger.debug('all games:', this.games);
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
      redTeam: game.players
        .filter((player) => player.team === Team.RED)
        .map((player) => player.name),
      blueTeam: game.players
        .filter((player) => player.team === Team.BLUE)
        .map((player) => player.name),
    });
  }

  getSerializedGameStarted(
    gameId: string,
    isDescriber?: boolean,
  ): GameStartedDto {
    const game = this.getGameById(gameId);

    return plainToClass(GameStartedDto, {
      id: game.id,
      name: game.name,
      host: game.host,
      redTeam: game.players
        .filter((player) => player.team === Team.RED)
        .map((player) => [player.name, this.hasUserSocketId(player.userId)]),
      blueTeam: game.players
        .filter((player) => player.team === Team.BLUE)
        .map((player) => [player.name, this.hasUserSocketId(player.userId)]),
      turn: game.turn
        ? {
            alreadyDescribed: game.turn.alreadyDescribed,
            team: game.turn.team,
            describerId: game.turn.describerId,
            describerName: game.turn.describerName,
          }
        : null,
      currentWord: isDescriber ? game.currentWord : undefined,
      score: game.score,
    });
  }

  isDescriber(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game.turn.describerId === userId;
  }

  getCurrentWord(gameId: string): string {
    const game = this.getGameById(gameId);
    return game.currentWord;
  }

  clearUserTimeout(userId: string): void {
    const user = this.getActiveUserById(userId);
    if (user && user.initialJoinTimeout) {
      clearTimeout(user.initialJoinTimeout);
      delete user.initialJoinTimeout;
    }
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

  getDescriberSocketId(gameId: string) {
    const game = this.getGameById(gameId);
    return this.getActiveUserById(game.turn.describerId).socketId;
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

  handleUserRemove(userId: string, gameId: string): void {
    this.removePlayerFromGame(userId, gameId);
    this.removeActiveUser(userId);

    if (this.isGameHost(userId, gameId) && !this.isGameEmpty(gameId)) {
      this.moveHostToNextUser(gameId);
    } else if (this.isGameEmpty(gameId)) {
      this.removeGameRoom(gameId);
    }
  }

  removePlayerFromGame(userId: string, gameId: string): void {
    const game = this.getGameById(gameId);
    game.players = game.players.filter((player) => player.userId !== userId);
  }

  private getTeamToJoin(gameId: string): Team {
    const game = this.getGameById(gameId);
    const redTeamPlayers = game.players.filter(
      (player) => player.team === Team.RED,
    );
    const blueTeamPlayers = game.players.filter(
      (player) => player.team === Team.BLUE,
    );
    return redTeamPlayers.length >= blueTeamPlayers.length
      ? Team.BLUE
      : Team.RED;
  }

  addUserToGame(userId: string, userName: string, gameId: string): void {
    const game = this.getGameById(gameId);
    const newPlayer: Player = {
      userId,
      name: userName,
      team: this.getTeamToJoin(gameId),
      inGameStats: {
        wordsGuessed: 0,
        wellDescribed: 0,
      },
    };
    game.players.push(newPlayer);
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
    emitGamesUpdated: (gameId?: string) => void,
  ): void {
    this.removePlayerFromGame(userId, gameId);
    this.removeActiveUser(userId);
    if (this.isGameEmpty(gameId)) {
      this.removeGameRoom(gameId);
      emitGamesUpdated();
    } else {
      this.moveHostToNextUser(gameId);
      emitGamesUpdated(gameId);
    }
  }

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

  gameNameExists(gameName: string): boolean {
    return this.games.some((game) => game.name === gameName);
  }

  endGame(gameId: string) {
    const game = this.getGameById(gameId);
    this.updatePlayersStats(game.players, game.score);
    this.saveInDatabase(game);
    this.removeGameRoom(gameId);
  }

  async saveInDatabase(game: Game): Promise<Games> {
    // Get Chat Id

    try {
      const newGame = new this.GamesModel({
        gameId: game.id,
        host: game.host,
        players: game.players,
        score: game.score,
        wordsUsed: game.wordsUsed,
      });

      // Save the game document in the database
      return await newGame.save();
    } catch (error) {
      throw new Error('Error saving in database');
    }
  }

  isAllowedToGuess(userId: string, gameId: string): boolean {
    const game = this.getGameById(gameId);
    const player = this.getPlayerById(userId, gameId);
    if (player && game.turn && player.team === game.turn.team) {
      return true;
    }

    return false;
  }

  async updatePlayersStats(
    players: Player[],
    gameScore: { red: number; blue: number },
  ): Promise<void> {
    for (const player of players) {
      const { userId, inGameStats } = player;
      const { wordsGuessed, wellDescribed } = inGameStats;

      try {
        // Prepare the update object
        const update: any = {
          $inc: {
            'stats.gamesPlayed': 1,
            'stats.wordsGuessed': wordsGuessed,
            'stats.wellDescribed': wellDescribed,
          },
        };

        // Check if the game is a draw or the player won/lost
        if (this.isGameDraw(gameScore)) {
          update.$inc['stats.draw'] = 1;
        } else if (this.isPlayerOnWinningTeam(player, gameScore)) {
          update.$inc['stats.wins'] = 1;
        } else {
          update.$inc['stats.loses'] = 1;
        }

        // Perform the update directly on the user document
        await this.userModel.updateOne({ _id: userId }, update);
      } catch (error) {
        console.error(`Error updating stats for user ${userId}: `, error);
      }
    }
  }

  // Function to determine if the game was a draw
  private isGameDraw(gameScore: { red: number; blue: number }): boolean {
    return gameScore.red === gameScore.blue;
  }

  // Function to determine if the player was on the winning team
  private isPlayerOnWinningTeam(
    player: Player,
    gameScore: { red: number; blue: number },
  ): boolean {
    const { team } = player;
    const winningTeam = gameScore.red > gameScore.blue ? 'redTeam' : 'blueTeam';
    return team === winningTeam;
  }

  async getUserStats(userName: string) {
    const user = await this.userModel.findOne({ username: userName });
    if (!user) {
      throw new Error(`User with username ${userName} not found`);
    }
    return {
      userName: userName,
      gamesPlayed: user.stats.gamesPlayed,
      wins: user.stats.wins,
      loses: user.stats.loses,
      draw: user.stats.draw,
      wordsGuessed: user.stats.wordsGuessed,
      wellDescribed: user.stats.wellDescribed,
    };
  }
}
