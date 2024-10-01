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
import { GameRoomService } from './game-room.service';
import { LobbyService } from 'src/lobby/lobby.service';

//TODO: add error emitters, handlers, try catch blocks
@WebSocketGateway({
  namespace: '/game-room',
  cors: {
    origin: '*',
  },
})
export class GameRoomGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gameService: GameRoomService,
    private readonly lobbyService: LobbyService,
  ) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);

    const { gameId, userId } = client.handshake.query as {
      gameId: string;
      userId: string;
    };
    try {
      this.gameService.addPlayerToGame(gameId, userId, client.id);
    } catch (error) {
      console.log(error);
    }
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }
}
