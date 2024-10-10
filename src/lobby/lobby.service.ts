import { Injectable, Logger } from '@nestjs/common';

import { JOIN_TIMEOUT, MAX_USERS } from '../types';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { GameStateService } from '../game-state/game-state.service'; 

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);

  constructor(private readonly gameStateService: GameStateService) {
    this.logger.log('LobbyService created');
  }

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
    this.logger.log(`Creating game: ${gameName} by ${userName}`);
    if (this.gameStateService.isUserActive(userId)) {
      throw new Error('User already in game');
    }

    if (this.gameStateService.gameNameExists(gameName)) {
      throw new Error('Game of specified name already exists');
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
    this.logger.log(`User ${userName} joining game: ${gameId}`);

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

    if (this.gameStateService.isGameStarted(gameId)) {
      throw new Error('Game already started');
    }

    //* Add the user to the game
    this.gameStateService.createJoinUser(
      userId,
      gameId,
      JOIN_TIMEOUT,
      emitGamesUpdated,
    );

    this.gameStateService.addUserToGame(userId, userName, gameId);
  }
}
