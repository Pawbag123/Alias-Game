import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

import { LobbyService } from './lobby.service';
import { Logger, UseGuards } from '@nestjs/common';
import { JoinGameGuard } from './guards/join-game.guard';
import { CreateGameGuard } from './guards/create-game.guard';
import { GameSettingsDto } from './dto/game-settings.dto';

/**
 * Gateway that handles connections in lobby, using lobby namespace
 * Handles game creation and joining
 */
@WebSocketGateway({
  namespace: 'lobby',
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LobbyGateway.name);

  @WebSocketServer()
  lobby: Namespace;

  constructor(private readonly lobbyService: LobbyService) {}

  /**
   * On connection, emit games to client
   * @param client - socket client
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to lobby: ${client.id}`);
    this.lobbyService.handleConnection(client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from lobby: ${client.id}`);
  }

  @SubscribeMessage('user-stats:get')
  async handleUserStatsGet(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Getting user stats for ${client.data.user.userName}`);
    try {
      await this.lobbyService.getUserStats(client);
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      throw new WsException(error.message);
    }
  }

  /**
   * Create game by calling lobby service,
   * then emit game:updated to redirect client and emit updated games to all clients
   * @param client - socket client
   * @param gameName - name of game to be created
   */
  @SubscribeMessage('game:create')
  handleSettings(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameSettings : GameSettingsDto,
  ): void {

    this.logger.log(`Creating game:${gameSettings.gameName}`);

    try {
      this.lobbyService.createGame(gameSettings, client, this.lobby);
    } catch (error) {
      this.logger.error('Error creating game:', error);
      throw new WsException(error.message);
    }
  }
  /**
   * Handler for joining game
   * Calls lobby service to join game, then emits game:joined to client that redirects him and games:updated to all clients
   * @param client - socket client
   * @param gameId - data to join game (gameId)
   */
  @SubscribeMessage('game:join')
  @UseGuards(JoinGameGuard)
  handleGameJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId }: { gameId: string },
  ): void {
    this.logger.log(`Client ${client.id} Joining game:`, gameId);

    try {
      this.lobbyService.joinGame(gameId, client, this.lobby);
    } catch (error) {
      this.logger.error('Error joining game:', error);
      throw new WsException(error.message);
    }
  }
}
