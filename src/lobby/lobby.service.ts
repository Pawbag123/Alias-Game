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
