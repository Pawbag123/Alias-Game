import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException('Game not found');
    }

    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new ForbiddenException('User not allowed to join game');
    }

    if (this.gameStateService.isGameStarted(gameId)) {
      throw new ForbiddenException('Game already started');
    }
    if (team !== Team.BLUE && team !== Team.RED) {
      throw new BadRequestException('Invalid team specified');
    }

    return true;
  }
}
