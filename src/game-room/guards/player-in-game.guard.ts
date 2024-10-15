import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class PlayerInGameGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const { gameId } = client.data;
    const userName: string = data.userName;

    // Check if player is in game
    if (!this.gameStateService.checkIfPlayerExistsInGame(userName, gameId)) {
      throw new BadRequestException('User is not in game');
    }

    return true;
  }
}
