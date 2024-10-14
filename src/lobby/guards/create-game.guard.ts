import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class CreateGameGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const gameName = data.gameName;
    const userId = client.data.user.userId;

    if (this.gameStateService.isUserActive(userId)) {
      throw new ConflictException('User already active in a game');
    }

    if (this.gameStateService.gameNameExists(gameName)) {
      throw new ConflictException('Game of specified name already exists');
    }

    return true;
  }
}
