import { Injectable } from '@nestjs/common';

import { JOIN_TIMEOUT, MAX_USERS } from './types';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { GameStateService } from 'src/shared/game-state.service';

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
  createGame(
    { gameName, userId, userName }: CreateGameDto,
    emitGamesUpdated: (gameId?: string) => void,
  ): string {
    if (this.gameStateService.isUserActive(userId)) {
      throw new Error('User already in game');
    }

    //* Create a new game
    return this.gameStateService.createGame(
      gameName,
      userId,
      userName,
      MAX_USERS,
      JOIN_TIMEOUT,
      emitGamesUpdated,
    );
    //TODO: implement for creation
    //* Set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
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
    if (this.gameStateService.isUserActive(userId)) {
      throw new Error('User already in game');
    }

    //* Find the game
    if (!this.gameStateService.getGameById(gameId)) {
      throw new Error('Game not found');
    }

    if (this.gameStateService.isGameFull(gameId)) {
      throw new Error('Game is full');
    }

    //* Add the user to the game
    this.gameStateService.createJoinUser(
      userId,
      gameId,
      JOIN_TIMEOUT,
      emitGamesUpdated,
    );

    this.gameStateService.addUserToGame(userId, userName, gameId);

    console.log(
      'User joined game:',
      this.gameStateService.getActiveUserById(userId),
    );
  }
}
