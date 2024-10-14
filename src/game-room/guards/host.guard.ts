import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class HostGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const {
      gameId,
      user: { userId },
    } = client.data;

    // Fetch the game details
    const game = this.gameStateService.getGameById(gameId);

    // Check if the user is the host
    if (game.host !== userId) {
      throw new ForbiddenException('You are not the host of this game');
    }

    return true;
  }
}
