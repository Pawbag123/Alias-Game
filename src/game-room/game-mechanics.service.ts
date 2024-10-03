import { Injectable } from '@nestjs/common';
import { GameStateService } from 'src/shared/game-state.service';

@Injectable()
export class GameMechanicsService {
  constructor(private readonly gameStateService: GameStateService) {
    console.log('GameMechanicsService created');
  }

  startGame(gameId: string): void {
    // add validation
    this.gameStateService.setGameStarted(gameId);
  }

  reconnectPlayer(userId: string, gameId: string, socketId: string): void {
    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }
    if (user.gameId !== gameId) {
      throw new Error('User not added to this game');
    }
    if (user.socketId) {
      throw new Error('User already in game');
    }
    this.gameStateService.addPlayerSocketId(userId, socketId);
  }
}
