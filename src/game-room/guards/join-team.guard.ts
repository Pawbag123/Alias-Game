import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameStateService } from 'src/game-state/game-state.service';
import { Team } from 'src/types';

@Injectable()
export class JoinTeamGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const {
      gameId,
      user: { userId },
    } = client.data;
    const team: Team = data.team;

    if (!this.gameStateService.gameExists(gameId)) {
      throw new WsException('Game not found');
    }

    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new WsException('User not allowed to join game');
    }

    if (this.gameStateService.isGameStarted(gameId)) {
      throw new WsException('Game already started');
    }
    if (team !== Team.BLUE && team !== Team.RED) {
      throw new WsException('Invalid team');
    }

    return true;
  }
}
