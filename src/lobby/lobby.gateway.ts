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
import { UseInterceptors } from '@nestjs/common';
import { GameSerializationInterceptor } from 'src/interceptors/game-serialization.interceptor';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { join } from 'path';
import { GameStateService } from 'src/shared/game-state.service';

//TODO: add error emitters, handlers, try catch blocks
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
   * @param client
   */
  handleConnection(client: Socket): void {
    console.log(`Client connected in lobby: ${client.id}`);

    // const games = this.lobbyService.getSerializedGames();
    const games = this.gameStateService.getSerializedGames();
    client.emit('games:updated', games);
    console.log('Emitting games:', games);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from lobby: ${client.id}`);
  }

  /**
   * Create game by calling lobby service,
   * then emit game:updated to redirect client and emit updated games to all clients
   * @param client
   * @param createGameDto - data to create game (userId, userName, gameName)
   */
  @SubscribeMessage('game:create')
  handleGameCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() createGameDto: CreateGameDto,
  ): void {
    console.log('Creating game:', createGameDto);

    try {
      const gameId = this.lobbyService.createGame(createGameDto);

      // const games = this.lobbyService.getSerializedGames();
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
    @MessageBody() joinGameDto: JoinGameDto,
  ): void {
    console.log('Joining game:', joinGameDto.gameId);

    try {
      this.lobbyService.joinGame(joinGameDto, () => {
        // const games = this.lobbyService.getSerializedGames();
        const games = this.gameStateService.getSerializedGames();
        this.server.emit('games:updated', games);
      });

      // const games = this.lobbyService.getSerializedGames();
      const games = this.gameStateService.getSerializedGames();

      client.emit('game:joined', joinGameDto.gameId);

      this.server.emit('games:updated', games);
    } catch (error) {
      console.log('Error joining game:', error);
      client.emit('game:join:error', error.message);
    }
  }
}
