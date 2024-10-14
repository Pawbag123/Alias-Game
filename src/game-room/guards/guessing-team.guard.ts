import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class GuessingTeamGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const {
      gameId,
      user: { userId },
    } = client.data;

    if (
      this.gameStateService.isGameStarted(gameId) &&
      !this.gameStateService.isAllowedToGuess(userId, gameId)
    ) {
      throw new ForbiddenException(
        'You are not allowed to guess in this turn. Enemy team is guessing',
      );
    }

    return true;
  }
}
