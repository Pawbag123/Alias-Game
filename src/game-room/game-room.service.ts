import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';

import { Team } from '../types';
import { GameStateService } from '../game-state/game-state.service';

@Injectable()
export class GameRoomService {
  private readonly logger = new Logger(GameRoomService.name);

  constructor(private readonly gameStateService: GameStateService) {
    this.logger.log('GameRoomService created');
  }

  //* Logic for transitioning a game from the lobby to the game room
  addPlayerToGame(gameId: string, userId: string, socketId: string): void {
    this.logger.log(`Adding user ${userId} to game ${gameId}`);

    //* Clear the timeout for removing the user from the game
    this.gameStateService.clearUserTimeout(userId);

    //* Add current socket ID to user
    this.gameStateService.getActiveUserById(userId).socketId = socketId;
  }

  handleUserConnectToGameRoom(client: Socket, gameRoom: Namespace): void {
    const {
      gameId,
      user: { userName, userId },
    } = client.data;
    this.addPlayerToGame(gameId, userId, client.id);

    this.logger.debug(`User ${userName} joined game ${gameId}`);
    client.join(gameId);

    gameRoom
      .to(gameId)
      .emit(
        'game-room:updated',
        this.gameStateService.getSerializedGameRoom(gameId),
      );

    client.broadcast.to(gameId).emit('chat:update', {
      userName: 'Server',
      message: `${userName} has joined the room`,
      time: new Date(),
    });
  }

  handleUserDisconnectFromGameRoom(
    client: Socket,
    gameRoom: Namespace,
    lobby: Namespace,
  ): void {
    const {
      gameId,
      user: { userId },
    } = client.data;
    this.logger.log(`Removing user ${userId} from game ${gameId}`);

    const user = this.gameStateService.getActiveUserById(userId);

    if (
      !this.gameStateService.gameExists(gameId) ||
      !user ||
      user.gameId !== gameId
    ) {
      return;
    }

    //* Remove user from game
    this.gameStateService.handleUserRemove(userId, gameId);

    this.updateGamesInfoAfterDisconnect(client, gameRoom, lobby);
  }

  joinTeam(team: Team, client: Socket, gameRoom: Namespace): void {
    const {
      gameId,
      user: { userId },
    } = client.data;

    this.gameStateService.movePlayerToTeam(userId, gameId, team);
    gameRoom
      .to(gameId)
      .emit(
        'game-room:updated',
        this.gameStateService.getSerializedGameRoom(gameId),
      );
  }

  isGameStarted(gameId: string): boolean {
    return (
      this.gameStateService.gameExists(gameId) &&
      this.gameStateService.isGameStarted(gameId)
    );
  }

  updateGamesInfoAfterDisconnect(
    client: Socket,
    gameRoom: Namespace,
    lobby: Namespace,
  ): void {
    const gameId = client.data.gameId;
    if (this.gameStateService.gameExists(gameId)) {
      gameRoom
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
      gameRoom.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `${client.data.user.userName} has left the room`,
        time: new Date(),
      });
    }

    lobby.emit('games:updated', this.gameStateService.getSerializedGames());
  }
}
