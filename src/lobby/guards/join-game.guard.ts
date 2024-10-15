import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class JoinGameGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const gameId = data.gameId;
    const userId = client.data.user.userId;

    // Check if the user is already in a game
    if (this.gameStateService.isUserActive(userId)) {
      throw new ConflictException('User already in a game');
    }

    // Check if the game exists
    if (!this.gameStateService.gameExists(gameId)) {
      throw new NotFoundException('Game not found');
    }

    // Check if the game is full
    if (this.gameStateService.isGameFull(gameId)) {
      throw new ForbiddenException('Game is full');
    }

    // Check if the game has already started
    if (this.gameStateService.isGameStarted(gameId)) {
      throw new ForbiddenException('Game already started');
    }

    return true;
  }
}
