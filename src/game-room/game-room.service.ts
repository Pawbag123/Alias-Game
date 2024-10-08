import { Injectable, Logger } from '@nestjs/common';

import { Team } from 'src/lobby/types';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class GameRoomService {
  private readonly logger = new Logger(GameRoomService.name);

  constructor(private readonly gameStateService: GameStateService) {
    console.log('GameRoomService created');
  }

  //* Logic for transitioning a game from the lobby to the game room
  addPlayerToGame(gameId: string, userId: string, socketId: string): void {
    this.logger.log(`Adding user ${userId} to game ${gameId}`);
    if (!this.gameStateService.gameExists(gameId)) {
      throw new Error('Game not found');
    }

    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.socketId) {
      throw new Error('User already in game');
    }

    // this should be omitted as gameId in user is to help with reconnecting to started game
    if (user.gameId !== gameId) {
      throw new Error('User not added to this game');
    }

    //* Clear the timeout for removing the user from the game
    clearTimeout(user.initialJoinTimeout);
    delete user.initialJoinTimeout;

    //* Add current socket ID to user
    user.socketId = socketId;
  }

  removePlayerFromGame(gameId: string, userId: string): void {
    this.logger.log(`Removing user ${userId} from game ${gameId}`);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.gameId !== gameId) {
      throw new Error('User not in this game');
    }

    //* Remove user from game
    this.gameStateService.removePlayerFromGame(userId, gameId);

    this.gameStateService.removeActiveUser(userId);

    if (
      this.gameStateService.isGameHost(userId, gameId) &&
      !this.gameStateService.isGameEmpty(gameId)
    ) {
      this.gameStateService.moveHostToNextUser(gameId);
    } else if (this.gameStateService.isGameEmpty(gameId)) {
      this.gameStateService.removeGameRoom(gameId);
    }

    //* Remove user from active users
  }

  joinRedTeam(gameId: string, userId: string): void {
    this.logger.log(`User ${userId} joining red team in game ${gameId}`);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    this.gameStateService.movePlayerToTeam(userId, gameId, Team.RED);
  }

  joinBlueTeam(gameId: string, userId: string): void {
    this.logger.log(`User ${userId} joining blue team in game ${gameId}`);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    this.gameStateService.movePlayerToTeam(userId, gameId, Team.BLUE);
  }
}
