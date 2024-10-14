import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class TooFewPlayersGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const gameId = client.data.gameId;

    // Fetch the game details
    if (this.gameStateService.checkIfGameHasTooFewPlayers(gameId)) {
      throw new BadRequestException(
        'Each team has to have at least 2 players to start the game',
      );
    }

    return true;
  }
}
