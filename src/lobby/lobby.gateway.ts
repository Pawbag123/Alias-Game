import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { LobbyService } from './lobby.service';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { GameStateService } from 'src/shared/game-state.service';

//TODO: add error emitters, handlers
/**
 * Gateway that handles connections in lobby, using lobby namespace
 * Handles game creation and joining
 */
@WebSocketGateway({
  namespace: '/lobby',
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameStateService: GameStateService,
  ) {}

  /**
   * On connection, emit games to client
   * @param client - socket client
   */
  handleConnection(client: Socket): void {
    console.log(`Client connected in lobby: ${client.id}`);
    const { userId, userName } = client.handshake.query;
    client.data.userId = userId;
    client.data.userName = userName;

    // const games = this.lobbyService.getSerializedGames();
    const games = this.gameStateService.getSerializedGames();
    client.emit('games:updated', games);
    console.log('Emitting games:', games);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from lobby: ${client.id}`);
  }

  //TODO: change games:updated to be emitted only after user joins game (not before redirecting)
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
      userId: client.data.userId,
      userName: client.data.userName,
      gameName,
    };
    console.log('Creating game:', createGameDto);

    try {
      const gameId = this.lobbyService.createGame(createGameDto);

      const games = this.gameStateService.getSerializedGames();

      client.emit('game:created', gameId);

      this.server.emit('games:updated', games);
    } catch (error) {
      console.log('Error creating game:', error);
      client.emit('game:create:error', error.message);
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
      userId: client.data.userId,
      userName: client.data.userName,
      gameId,
    };
    console.log('Joining game:', joinGameDto.gameId);

    try {
      this.lobbyService.joinGame(joinGameDto, () => {
        const games = this.gameStateService.getSerializedGames();
        this.server.emit('games:updated', games);
      });

      const games = this.gameStateService.getSerializedGames();

      client.emit('game:joined', joinGameDto.gameId);

      this.server.emit('games:updated', games);
    } catch (error) {
      console.log('Error joining game:', error);
      client.emit('game:join:error', error.message);
    }
  }
}
