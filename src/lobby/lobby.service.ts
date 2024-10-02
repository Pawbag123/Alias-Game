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
import { GameStateService } from 'src/shared/game-state.service';
import { emit } from 'process';

@Injectable()
export class LobbyService {
  constructor(private readonly gameStateService: GameStateService) {
    console.log('LobbyService created');
  }

  //TODO: add validation/error throwing
  /**
   * Handles logic for game creation:
   * - Create a new game
   * - Add the user data to the game (allow him to join)
   * - Set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
   * @returns id of created games
   */
  createGame({ gameName, userId, userName }: CreateGameDto): string {
    if (this.gameStateService.checkIfUserIsInGame(userId)) {
      throw new Error('User already in game');
    }

    return this.gameStateService.createGame(
      gameName,
      userId,
      userName,
      MAX_USERS,
      JOIN_TIMEOUT,
      () => {},
    );
    // //* Create a new game
    // const newGame: Game = {
    //   id: Math.random().toString(36).substr(2, 9),
    //   name: gameName,
    //   host: userId,
    //   isGameStarted: false,
    //   redTeam: [],
    //   blueTeam: [],
    //   noTeam: [userId],
    //   maxUsers: MAX_USERS,
    // };
    // this.gameStateService.games.push(newGame);

    // //* Add the user to the game
    // const newActiveUser: ActiveUser = {
    //   id: userId,
    //   name: userName,
    //   gameId: newGame.id,
    // };
    // this.gameStateService.activeUsers.push(newActiveUser);

    //TODO: implement for creation
    //* Set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
    // newActiveUser.initialJoinTimeout = setTimeout(() => {
    //   // this.handleUserJoinTimeout();
    // }, JOIN_TIMEOUT);

    // return newGame.id;
  }

  /**
   * Handles logic for joining a game:
   * - validate if user is already in a game
   * - find the game
   * - validate if the game is full
   * - add the user to the game (allow him to join)
   * - set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
   * @param gameId - id of the game to join
   * @param userId - id of the user joining
   * @param userName - name of the user joining
   * @param emitGamesUpdated - function to emit updated games to all clients, works as a callback in timeout
   */
  joinGame(
    { gameId, userId, userName }: JoinGameDto,
    emitGamesUpdated: () => void,
  ): void {
    // if (this.gameStateService.activeUsers.find((user) => user.id === userId)) {
    if (this.gameStateService.checkIfUserIsInGame(userId)) {
      throw new Error('User already in game');
    }

    //* Find the game
    // const game = this.gameStateService.games.find((game) => game.id === gameId);
    // if (!game) {
    if (!this.gameStateService.getGameById(gameId)) {
      throw new Error('Game not found');
    }

    // if (
    //   game.maxUsers <=
    //   game.redTeam.length + game.blueTeam.length + game.noTeam.length
    // )
    if (this.gameStateService.isGameFull(gameId)) {
      throw new Error('Game is full');
    }

    this.gameStateService.createJoinUser(
      userId,
      userName,
      gameId,
      JOIN_TIMEOUT,
      emitGamesUpdated,
    );

    this.gameStateService.addUserToGame(userId, gameId);
    //* Add the user to the game
    // const newActiveUser: ActiveUser = {
    //   id: userId,
    //   name: userName,
    //   gameId: gameId,
    // };
    // this.gameStateService.activeUsers.push(newActiveUser);
    // game.noTeam.push(userId);
    // newActiveUser.initialJoinTimeout = setTimeout(() => {
    //   this.handleUserJoinTimeout(userId, gameId, emitGamesUpdated);
    // }, JOIN_TIMEOUT);
    console.log(
      'User joined game:',
      this.gameStateService.getActiveUserById(userId),
    );
  }
}
