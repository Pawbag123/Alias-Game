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

//TODO: add error emitters, handlers, try catch blocks
@WebSocketGateway({
  namespace: '/lobby',
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected in lobby: ${client.id}`);

    const games = this.lobbyService.getSerializedGames();
    client.emit('games:updated', games);
    console.log('Emitting games:', games);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from lobby: ${client.id}`);
  }

  @SubscribeMessage('game:create')
  handleGameCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() createGameDto: CreateGameDto,
  ): void {
    console.log('Creating game:', createGameDto);

    try {
      const gameId = this.lobbyService.createGame(createGameDto);

      const games = this.lobbyService.getSerializedGames();

      client.emit('game:created', gameId);

      this.server.emit('games:updated', games);
    } catch (error) {
      console.log('Error creating game:', error);
      client.emit('game:create:error', error.message);
    }
  }

  @SubscribeMessage('game:join')
  handleGameJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinGameDto: JoinGameDto,
  ): void {
    console.log('Joining game:', joinGameDto.gameId);

    try {
      this.lobbyService.joinGame(joinGameDto, () => {
        const games = this.lobbyService.getSerializedGames();
        this.server.emit('games:updated', games);
      });

      const games = this.lobbyService.getSerializedGames();

      client.emit('game:joined', joinGameDto.gameId);

      this.server.emit('games:updated', games);
    } catch (error) {
      console.log('Error joining game:', error);
      client.emit('game:join:error', error.message);
    }
  }
}
