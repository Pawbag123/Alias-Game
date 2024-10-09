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
import { Namespace, Server, Socket } from 'socket.io';

import { LobbyService } from './lobby.service';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { GameStateService } from 'src/game-state/game-state.service';
import { Logger } from '@nestjs/common';

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

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameStateService: GameStateService,
  ) {}

  /**
   * On connection, emit games to client
   * @param client - socket client
   */
  handleConnection(client: Socket): void {
    const { userId, userName } = client.data.user;

    this.logger.log(`Client connected to lobby: ${userName}`);

    const gameId = this.gameStateService.checkIfUserIsInGame(userId);
    if (gameId) {
      client.emit('game:joined', gameId);
      return;
    }

    const games = this.gameStateService.getSerializedGames();
    client.emit('games:updated', games);
    this.logger.log(`Emitting games: to client: ${userName}`, games);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from lobby: ${client.id}`);
  }

  @SubscribeMessage('user-stats:get')
  handleUserStatsGet(@ConnectedSocket() client: Socket): void {
    const { userId } = client.data.user;
    // const userStats = this.gameStateService.getUserStats(userId);
    const userStats = {
      userName: 'user',
      gamesPlayed: 4,
      gamesWon: 2,
      gamesLost: 1,
      draws: 1,
      wordsGuessed: 12,
      wordsDescribed: 20,
    };
    client.emit('user-stats', userStats);
  }

  /**
   * Create game by calling lobby service,
   * then emit game:updated to redirect client and emit updated games to all clients
   * @param client - socket client
   * @param createGameDto - data to create game (userId, userName, gameName)
   */
  @SubscribeMessage('game:create')
  handleGameCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameName }: { gameName: string },
  ): void {
    const createGameDto: CreateGameDto = {
      userId: client.data.user.userId,
      userName: client.data.user.userName,
      gameName,
    };
    this.logger.log('Creating game:', createGameDto);

    try {
      const gameId = this.lobbyService.createGame(
        createGameDto,
        this.gameCreationHandler,
      );

      const games = this.gameStateService.getSerializedGames();

      client.emit('game:created', gameId);

      client.broadcast.emit('games:updated', games);
    } catch (error) {
      this.logger.error('Error creating game:', error);
      throw new WsException(error.message);
    }
  }

  /**
   * Handler for joining game
   * Calls lobby service to join game, then emits game:joined to client that redirects him and games:updated to all clients
   * @param client - socket client
   * @param joinGameDto - data to join game (userId, userName, gameId)
   */
  @SubscribeMessage('game:join')
  handleGameJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId }: { gameId: string },
  ): void {
    const joinGameDto: JoinGameDto = {
      userId: client.data.user.userId,
      userName: client.data.user.userName,
      gameId,
    };
    this.logger.log(
      `User ${joinGameDto.userName} Joining game:`,
      joinGameDto.gameId,
    );

    try {
      this.lobbyService.joinGame(joinGameDto, this.gameJoinHandler);

      const games = this.gameStateService.getSerializedGames();

      client.emit('game:joined', joinGameDto.gameId);

      client.broadcast.emit('games:updated', games);
    } catch (error) {
      this.logger.error('Error joining game:', error);
      throw new WsException(error.message);
    }
  }

  gameCreationHandler = (gameId?: string) => {
    const games = this.gameStateService.getSerializedGames();
    this.lobby.emit('games:updated', games);
    if (gameId) {
      this.lobby.server
        .of('game-room')
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
    }
  };

  gameJoinHandler = () => {
    const games = this.gameStateService.getSerializedGames();
    this.lobby.emit('games:updated', games);
  };
}
