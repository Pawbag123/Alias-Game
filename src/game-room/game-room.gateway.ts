import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
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

  @WebSocketServer()
  lobby: Namespace;

  constructor(
    private readonly gameService: GameRoomService,
    private readonly lobbyService: LobbyService,
  ) {}

  afterInit() {
    this.lobby = this.lobby.server.of('/lobby');
  }

  handleConnection(client: Socket): void {
    console.log(`Client connected in game room: ${client.id}`);

    const { gameId, userId } = client.handshake.query as {
      gameId: string;
      userId: string;
    };
    try {
      this.gameService.addPlayerToGame(gameId, userId, client.id);
    } catch (error) {
      client.emit('game-room:join:error', error.message);
      console.log(error);
      return;
    }

    client.join(gameId);
    this.server
      .to(gameId)
      .emit(
        'game-room:updated',
        this.lobbyService.getSerializedGameRoom(gameId),
      );
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from game room: ${client.id}`);
    const user = this.gameService.findUserBySocketId(client.id);
    console.log('User:', user);
    if (!user) {
      return;
    }
    const gameId = user.gameId;
    if (!gameId) {
      return;
    }
    try {
      this.gameService.removePlayerFromGame(gameId, user.id);
    } catch (error) {
      console.log(error);
    }
    if (this.gameService.gameExists(gameId)) {
      this.server
        .to(gameId)
        .emit(
          'game-room:updated',
          this.lobbyService.getSerializedGameRoom(gameId),
        );
    }

    this.lobby.emit('games:updated', this.lobbyService.getSerializedGames());
  }

  @SubscribeMessage('game-room:leave')
  handleLeaveGame(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.emit('game-room:left');
    client.disconnect();
    // try {
    //   this.gameService.removePlayerFromGame(gameId, userId);
    // } catch (error) {
    //   console.log(error);
    // }

    // client.leave(gameId);

    // this.server
    //   .to(gameId)
    //   .emit(
    //     'game-room:updated',
    //     this.lobbyService.getSerializedGameRoom(gameId),
    //   );

    // // this.server
    // //   .of('/lobby')
    // //   .emit('games:updated', this.lobbyService.getSerializedGames());
    // this.server.to(client.id).emit('game-room:left');
  }

  @SubscribeMessage('game-room:join:red')
  handleJoinRedTeam(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
  ) {
    try {
      this.gameService.joinRedTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    this.server
      .to(gameId)
      .emit(
        'game-room:updated',
        this.lobbyService.getSerializedGameRoom(gameId),
      );
  }

  @SubscribeMessage('game-room:join:blue')
  handleJoinBlueTeam(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
  ) {
    try {
      this.gameService.joinBlueTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    if (this.gameService.gameExists(gameId)) {
      this.server
        .to(gameId)
        .emit(
          'game-room:updated',
          this.lobbyService.getSerializedGameRoom(gameId),
        );
    }
  }
}
