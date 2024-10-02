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

//TODO: add error emitters, handlers, try catch blocks, extend logic after game is started
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

  /**
   * Connection handler, that will check if user can join the game,
   * add him to the game (that means setting his socketId),
   * join the room and emit updated game room to all clients in the room
   * @param client - socket client
   * @returns
   */
  handleConnection(client: Socket): void {
    console.log(`Client connected in game room: ${client.id}`);

    const { gameId, userId } = client.handshake.query as {
      gameId: string;
      userId: string;
    };
    try {
      this.gameRoomService.addPlayerToGame(gameId, userId, client.id);
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
        this.gameStateService.getSerializedGameRoom(gameId),
      );
  }

  /**
   * Handler for disconnecting from game room
   * (this should work only if game is not started, else only his socketId should be removed, so he can reconnect)
   * Removes player from the game, deletes his ActiveUser data,
   * emits updated game room to all clients in the room
   * emits updated games to all clients in the lobby
   * @param client
   * @returns
   */
  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected from game room: ${client.id}`);
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
      this.gameRoomService.removePlayerFromGame(gameId, user.id);
    } catch (error) {
      console.log(error);
    }
    if (this.gameStateService.gameExists(gameId)) {
      this.server
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
    }

    this.lobby.emit(
      'games:updated',
      this.gameStateService.getSerializedGames(),
    );
  }

  /**
   * Handler for leaving game room
   * Emits game-room:left to client so he gets redirected to lobby
   * and disconnects him, so logic for disconnecting is called
   * @param client - socket client
   */
  @SubscribeMessage('game-room:leave')
  handleLeaveGame(@ConnectedSocket() client: Socket) {
    client.emit('game-room:left');
    client.disconnect();
  }

  /**
   * Handler to join red team
   * Calls game room service to join red team,
   * emits updated game room to all clients in the room
   */
  @SubscribeMessage('game-room:join:red')
  handleJoinRedTeam(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
  ) {
    try {
      this.gameRoomService.joinRedTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    this.server
      .to(gameId)
      .emit(
        'game-room:updated',
        this.gameStateService.getSerializedGameRoom(gameId),
      );
  }

  /**
   * Handler to join blue team
   * Calls game room service to join blue team,
   * emits updated game room to all clients in the room
   */
  @SubscribeMessage('game-room:join:blue')
  handleJoinBlueTeam(
    @MessageBody() { gameId, userId }: { gameId: string; userId: string },
  ) {
    try {
      this.gameRoomService.joinBlueTeam(gameId, userId);
    } catch (error) {
      console.log(error);
    }

    if (this.gameStateService.gameExists(gameId)) {
      this.server
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
    }
  }
}
