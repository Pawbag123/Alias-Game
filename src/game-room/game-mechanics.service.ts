import { Injectable } from '@nestjs/common';
import { GameStateService } from 'src/shared/game-state.service';

@Injectable()
export class GameMechanicsService {
  constructor(private readonly gameStateService: GameStateService) {
    console.log('GameMechanicsService created');
  }

  public startGame(gameId: string): void {
    // add validation
    const game = this.gameStateService.getGameById(gameId);
    game.isGameStarted = true;
  }
}
