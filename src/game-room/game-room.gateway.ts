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
import { GameStateService } from 'src/shared/game-state.service';

//TODO: add error emitters, handlers, try catch blocks
/**
 * Gateway that handles connections in game room, using game-room namespace
 * Handles connecting and disconnecting from game room, joining teams, leaving game
 */
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

  /**
   * Lobby namespace
   */
  @WebSocketServer()
  lobby: Namespace;

  constructor(
    private readonly gameRoomService: GameRoomService,
    private readonly gameStateService: GameStateService,
  ) {}

  /**
   * After init, set lobby namespace,
   * has to be done in order to emit events to lobby namespace, like updating games
   */
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
      // this.lobbyService.addPlayerToGame(gameId, userId, client.id);
      this.gameRoomService.addPlayerToGame(gameId, userId, client.id);
    } catch (error) {
      client.emit('game-room:join:error', error.message);
      console.log(error);
      return;
    }

    client.join(gameId);
    this.server.to(gameId).emit(
      'game-room:updated',
      // this.lobbyService.getSerializedGameRoom(gameId),
      this.gameStateService.getSerializedGameRoom(gameId),
    );
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from game room: ${client.id}`);
    // const user = this.lobbyService.findUserBySocketId(client.id);
    const user = this.gameStateService.findUserBySocketId(client.id);
    console.log('User:', user);
    if (!user) {
      return;
    }
    const gameId = user.gameId;
    if (!gameId) {
      return;
    }
    try {
      // this.lobbyService.removePlayerFromGame(gameId, user.id);
      this.gameRoomService.removePlayerFromGame(gameId, user.id);
    } catch (error) {
      console.log(error);
    }
    // if (this.lobbyService.gameExists(gameId)) {
    if (this.gameStateService.gameExists(gameId)) {
      this.server.to(gameId).emit(
        'game-room:updated',
        // this.lobbyService.getSerializedGameRoom(gameId),
        this.gameStateService.getSerializedGameRoom(gameId),
      );
    }

    // this.lobby.emit('games:updated', this.lobbyService.getSerializedGames());
    this.lobby.emit(
      'games:updated',
      this.gameStateService.getSerializedGames(),
    );
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
      // this.lobbyService.joinRedTeam(gameId, userId);
      this.gameRoomService.joinRedTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    this.server.to(gameId).emit(
      'game-room:updated',
      // this.lobbyService.getSerializedGameRoom(gameId),
      this.gameStateService.getSerializedGameRoom(gameId),
    );
  }

  @SubscribeMessage('game-room:join:blue')
  handleJoinBlueTeam(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
  ) {
    try {
      // this.lobbyService.joinBlueTeam(gameId, userId);
      this.gameRoomService.joinBlueTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    // if (this.lobbyService.gameExists(gameId)) {
    if (this.gameStateService.gameExists(gameId)) {
      this.server.to(gameId).emit(
        'game-room:updated',
        // this.lobbyService.getSerializedGameRoom(gameId),
        this.gameStateService.getSerializedGameRoom(gameId),
      );
    }
  }
}
