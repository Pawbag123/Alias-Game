import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class GuessingTeamGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const gameId = client.data.gameId;
    const userId = client.data.user.userId;

    if (
      this.gameStateService.isGameStarted(gameId) &&
      !this.gameStateService.isAllowedToGuess(userId, gameId)
    ) {
      throw new WsException('You are not allowed to guess in this turn');
    }

    return true;
  }
}
