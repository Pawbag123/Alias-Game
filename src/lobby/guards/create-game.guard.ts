import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class CreateGameGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    // Access WebSocket client and message body
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData(); // Extract the message body

    const gameName = data.gameName; // `gameId` from the message body
    const userId = client.data.user.userId; // `userId` from socket data

    if (this.gameStateService.isUserActive(userId)) {
      throw new WsException('User already in game');
    }

    if (this.gameStateService.gameNameExists(gameName)) {
      throw new WsException('Game of specified name already exists');
    }

    return true;
  }
}
