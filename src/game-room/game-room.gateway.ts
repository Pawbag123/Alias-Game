import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

import { GameRoomService } from './game-room.service';
import { GameStateService } from 'src/shared/game-state.service';
import { GameMechanicsService } from './game-mechanics.service';
import { Team } from 'src/lobby/types';

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

  @WebSocketServer()
  gameRoom: Namespace;

  constructor(
    private readonly gameRoomService: GameRoomService,
    private readonly gameStateService: GameStateService,
    private readonly gameMechanicsService: GameMechanicsService,
  ) {}

  /**
   * After init, set lobby namespace,
   * has to be done in order to emit events to lobby namespace, like updating games
   */
  afterInit() {
    this.lobby = this.lobby.server.of('/lobby');
    this.gameRoom = this.gameRoom.server.of('/game-room');
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

    client.data.userId = userId;
    client.data.gameId = gameId;

    if (
      this.gameStateService.getGameById &&
      this.gameStateService.getGameById(gameId).isGameStarted
    ) {
      try {
        //TODO: ADD validation if user is allowed to join the game
        this.gameMechanicsService.reconnectPlayer(userId, gameId, client.id);
        this.server
          .to(gameId)
          .emit(
            'game-started:updated',
            this.gameStateService.getSerializedGameStarted(gameId),
          );
      } catch (error) {
        client.emit('game-started:join:error', error.message);
        console.log(error);
      }
    } else {
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
    const { gameId, userId } = client.data;
    // if game is started, only remove socketId
    if (this.gameStateService.getGameById(gameId).isGameStarted) {
      //TODO implement updating game state
      this.gameStateService.removePlayerSocketId(userId);
      this.server
        .to(gameId)
        .emit(
          'game-started:updated',
          this.gameStateService.getSerializedGameStarted(gameId),
        );
    } else {
      // else remove player from game, and delete his ActiveUser data
      try {
        this.gameRoomService.removePlayerFromGame(gameId, userId);
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
  handleJoinRedTeam(@ConnectedSocket() client: Socket) {
    const { gameId, userId } = client.data;
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
  handleJoinBlueTeam(@ConnectedSocket() client: Socket) {
    const { gameId, userId } = client.data;
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

  /**
   * Handler to start game
   * Calls game mechanics service to start the game
   * @param gameId - id of the game to start
   */
  @SubscribeMessage('game-room:start')
  handleStartGame(@ConnectedSocket() client: Socket) {
    const { gameId } = client.data;
    try {
      this.gameMechanicsService.startGame(gameId);
      const sockets = this.gameStateService.getPlayersWithSocketsInGame(gameId);
      console.log(sockets);
      sockets.forEach(
        ({ socketId, team }: { socketId: string; team: Team }) => {
          console.log('socket');
          console.log(socketId, team);
          const socket: Socket = this.gameRoom.sockets.get(socketId);
          if (socket) {
            socket.join(`${gameId}/${team}`);
            socket.data.team = team;
          }
        },
      );
      this.server
        .to(gameId)
        .emit(
          'game-started:updated',
          this.gameStateService.getSerializedGameStarted(gameId),
        );
    } catch (error) {
      console.log(error);
      this.server.to(gameId).emit('game-room:start:error', error.message);
    }
  }

  /**
   * Handler to send message
   * Emits message to all clients in the room
   * @param message - message to send
   */
  @SubscribeMessage('game-started:send-message')
  handleMessage(@ConnectedSocket() client: Socket): void {
    const { gameId, userId, team } = client.data;
    const playerName = this.gameStateService.getPlayerById(userId, gameId).name;
    this.server.to(`${gameId}/${team}`).emit('game-started:message-received', {
      sender: playerName,
      text: 'hello world',
    });
  }
}
