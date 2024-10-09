import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

import { GameRoomService } from './game-room.service';
import { GameStateService } from 'src/game-state/game-state.service';
import { GameMechanicsService } from './game-mechanics.service';
import { Team } from 'src/types';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { GameStartedDto } from './dto/game-started-dto';
import { HostGuard } from './guards/host.guard';
import { WsExceptionFilter } from 'src/exceptions/ws-exception-filter';
import { TooFewPlayersGuard } from './guards/too-few-players.guard';
import { GuessingTeamGuard } from './guards/guessing-team.guard';
import { time } from 'console';

//TODO: add error emitters, handlers, try catch blocks, extend logic after game is started
//TODO: change server emit to namespace emit
/**
 * Gateway that handles connections in game room, using game-room namespace
 * Handles connecting and disconnecting from game room, joining teams, leaving game
 */
// @UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: 'game-room',
  cors: {
    origin: '*',
  },
})
export class GameRoomGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameRoomGateway.name);

  @WebSocketServer()
  gameRoom: Namespace;

  /**
   * Lobby namespace
   */
  lobby: Namespace;

  constructor(
    private readonly gameRoomService: GameRoomService,
    private readonly gameStateService: GameStateService,
    private readonly gameMechanicsService: GameMechanicsService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * After init, set lobby namespace,
   * has to be done in order to emit events to lobby namespace, like updating games
   */
  afterInit() {
    this.lobby = this.gameRoom.server.of('lobby');
  }

  updateGameState(gameId: string) {
    this.gameRoom
      .to(gameId)
      .emit(
        'game-room:updated',
        this.gameStateService.getSerializedGameRoom(gameId),
      );
  }

  /**
   * Connection handler, that will check if user can join the game,
   * add him to the game (that means setting his socketId),
   * join the room and emit updated game room to all clients in the room
   * @param client - socket client
   * @returns
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected in game room: ${client.id}`);

    const { gameId } = client.handshake.query as {
      gameId: string;
    };
    const { userId, userName } = client.data.user;

    client.data.gameId = gameId;

    // Fetch and send missed messages, partially working
    const lastMessageId = client.handshake.auth.serverOffset ?? 0;
    this.logger.log('serverOffset: ', lastMessageId);
    this.chatService
      .getMessagesAfter(lastMessageId, gameId)
      .then((recoveredMessages) => {
        recoveredMessages.forEach((message) => {
          client.emit('chat:update', message);
        });
      })
      .catch((error) => {
        this.logger.error('Error recovering chat messages:', error);
        throw new WsException(error.message);
      });

    if (
      this.gameStateService.gameExists(gameId) &&
      this.gameStateService.getGameById(gameId).isGameStarted
    ) {
      try {
        this.gameMechanicsService.reconnectPlayer(userId, gameId, client.id);
        client.join(gameId);
        // const team = this.gameStateService.getTeamOfPlayer(userId, gameId);
        this.gameRoom
          .to(gameId)
          .emit(
            'game-started:updated',
            this.gameStateService.getSerializedGameStarted(gameId),
          );
        client.broadcast.to(gameId).emit('chat:update', {
          userName: 'Server',
          message: `${userName} has reconnected`,
          time: new Date(),
        });
      } catch (error) {
        this.logger.error(error);
        throw new WsException(error.message);
      }
    } else {
      try {
        this.gameRoomService.addPlayerToGame(gameId, userId, client.id);
      } catch (error) {
        this.logger.error(error);
        throw new WsException(error.message);
      }

      client.join(gameId);
      this.gameRoom
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
      client.broadcast.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `${userName} has joined the room`,
        time: new Date(),
      });
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
    this.logger.log(`Client disconnected from game room: ${client.id}`);
    const gameId = client.data.gameId;
    const userId = client.data.user.userId;
    // if game is started, only remove socketId
    if (
      this.gameStateService.gameExists(gameId) &&
      this.gameStateService.getGameById(gameId).isGameStarted
    ) {
      this.gameStateService.removePlayerSocketId(userId);
      this.gameRoom
        .to(gameId)
        .emit(
          'game-started:updated',
          this.gameStateService.getSerializedGameStarted(gameId),
        );
      this.gameRoom.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `${client.data.user.userName} has disconnected`,
        time: new Date(),
      });
    } else {
      // else remove player from game, and delete his ActiveUser data
      try {
        this.gameRoomService.removePlayerFromGame(gameId, userId);
      } catch (error) {
        this.logger.error(error);
        // throw new WsException(error.message);
      }
      if (this.gameStateService.gameExists(gameId)) {
        this.gameRoom
          .to(gameId)
          .emit(
            'game-room:updated',
            this.gameStateService.getSerializedGameRoom(gameId),
          );
        this.gameRoom.to(gameId).emit('chat:update', {
          userName: 'Server',
          message: `${client.data.user.userName} has left the room`,
          time: new Date(),
        });
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
  @SubscribeMessage('game-room:join')
  handleJoinTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() { team }: { team: Team },
  ) {
    const gameId = client.data.gameId;
    const userId = client.data.user.userId;
    try {
      if (this.gameStateService.isGameStarted(gameId)) {
        throw new Error('Game already started');
      }
      if (team === Team.RED) {
        this.gameRoomService.joinRedTeam(gameId, userId);
      } else if (team === Team.BLUE) {
        this.gameRoomService.joinBlueTeam(gameId, userId);
      } else {
        throw new Error('Invalid team');
      }
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }

    this.gameRoom
      .to(gameId)
      .emit(
        'game-room:updated',
        this.gameStateService.getSerializedGameRoom(gameId),
      );
  }

  /**
   * Handler to start game
   * Calls game mechanics service to start the game
   * @param gameId - id of the game to start
   */
  @SubscribeMessage('game-room:start')
  @UseGuards(HostGuard, TooFewPlayersGuard)
  handleStartGame(@ConnectedSocket() client: Socket) {
    const { gameId } = client.data;
    try {
      this.gameMechanicsService.startGame(gameId);
      this.lobby.emit(
        'games:updated',
        this.gameStateService.getSerializedGames(),
      );
      //* this.gameMechanicsService.turns(gameId); this didn't work
      this.handleTurns(gameId);
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }
  }

  //! Heres where turns are managed
  async handleTurns(gameId: string) {
    let rounds = 0;
    const totalRounds = 2;

    while (rounds < totalRounds) {
      this.gameMechanicsService.nextTurn(gameId); // Handles both game initialization and next turn
      this.gameMechanicsService.newWord(gameId); // Generate a new word

      // find socket that is describing
      // emit game-started:updated:desc to him
      // emit game-started:updated to all the others

      this.gameRoom
        .to(gameId)
        .emit(
          'game-started:updated',
          this.gameStateService.getSerializedGameStarted(gameId),
        );
      const { turn, currentWord } = this.gameStateService.getGameById(gameId);
      console.log(`STATE NUMBER ${rounds}`, turn);
      console.log(currentWord);

      await this.startTimer(gameId, 30); // 10 seconds for each turn

      rounds++;
    }

    this.gameRoom
      .to(gameId)
      .emit('game:end', this.gameStateService.getSerializedGameStarted(gameId));

    this.gameStateService.endGame(gameId);
    // Disconnect all sockets connected to room gameId
    const sockets = await this.gameRoom.in(gameId).fetchSockets();
    sockets.forEach((socket) => socket.disconnect());
    this.lobby.emit(
      'games:updated',
      this.gameStateService.getSerializedGames(),
    );
  }

  async startTimer(gameId: string, duration: number) {
    for (let remaining = duration; remaining > 0; remaining--) {
      this.gameRoom.to(gameId).emit('timer:update', { remaining });
      await this.delay(1000); // Wait for 1 second before next update
    }
  }
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @SubscribeMessage('user-stats:get')
  async handleUserStatsGet(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userName }: { userName: string },
  ): Promise<any> {
    this.logger.log('User stats requested', userName);
     const userStats = await this.gameStateService.getUserStats(userName);
     console.log("STATS HERE: ", userStats);
    client.emit('user-stats', userStats);
  }

  //!
  /*   @SubscribeMessage('game:word-guessed')
  async wordGuessed(gameId: string) {
    this.gameMechanicsService.playerGuessed(gameId)
    this.server.to(gameId).emit(
      'game-started:updated', //? 'game-started:new-turn'
      this.gameStateService.getSerializedGameStarted(gameId)
    );
  } */

  @SubscribeMessage('chat:message')
  @UseGuards(GuessingTeamGuard)
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { message }: { message: string }, // Temporarily 'any'
  ): Promise<void> {
    // const { userId, userName, gameId } = payload;
    const { userName, userId } = client.data.user;
    const { gameId } = client.data;
    this.logger.log(`Chat message received: ${message}`);
    let validatedMessage;
    let isGuessed;
    try {
      [validatedMessage, isGuessed] = this.gameMechanicsService.validateWord(
        userId,
        gameId,
        message,
      );
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }

    this.logger.debug('Validated message:', validatedMessage);
    const chatResponse = await this.chatService.handleChatMessage(
      userId,
      userName,
      gameId,
      validatedMessage,
    );

    this.logger.debug('Chat response:', chatResponse);

    this.gameRoom.to(gameId).emit('chat:update', chatResponse);

    if (isGuessed) {
      this.logger.debug('Word guessed');
      this.gameRoom.to(gameId).emit(
        'game-started:updated', // or 'game-started:new-turn' if you want to indicate a new turn
        this.gameStateService.getSerializedGameStarted(gameId),
      );
    }
  }
}
