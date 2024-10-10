import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class JoinGameGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    // Access WebSocket client and message body
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData(); // Extract the message body

    const gameId = data.gameId; // `gameId` from the message body
    const userId = client.data.user.userId; // `userId` from socket data

    // Check if the user is already in a game
    if (this.gameStateService.isUserActive(userId)) {
      throw new WsException('User already in a game');
    }

    // Check if the game exists
    if (!this.gameStateService.gameExists(gameId)) {
      throw new WsException('Game not found');
    }

    if (this.gameStateService.isGameFull(gameId)) {
      throw new WsException('Game is full');
    }

    // Check if the game has already started
    if (this.gameStateService.isGameStarted(gameId)) {
      throw new WsException('Game already started');
    }

    return true;
  }
}
