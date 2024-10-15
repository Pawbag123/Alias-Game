import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class SkipWordGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const {
      gameId,
      user: { userId },
    } = client.data;

    // Fetch the game details
    if (!this.gameStateService.isGameStarted(gameId)) {
      throw new ForbiddenException('Game not started');
    }

    if (!this.gameStateService.hasSkipsLeft(gameId)) {
      throw new ForbiddenException('No skips left');
    }

    if (!this.gameStateService.isDescriber(userId, gameId)) {
      throw new ForbiddenException('You are not the describer');
    }

    return true;
  }
}
