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
import { Namespace, Socket } from 'socket.io';

import { GameRoomService } from './game-room.service';
import { GameStateService } from 'src/game-state/game-state.service';
import { GameMechanicsService } from './game-mechanics.service';
import { MAX_TURNS, Team, TURN_TIME, WordStatus } from 'src/types';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { HostGuard } from './guards/host.guard';
import { TooFewPlayersGuard } from './guards/too-few-players.guard';
import { GuessingTeamGuard } from './guards/guessing-team.guard';
import { validateDescriberMessage } from 'src/utils/describe-validation';
import { checkGuessedWord } from 'src/utils/guess-validation';
import { use } from 'passport';

/**
 * Gateway that handles connections in game room, using game-room namespace
 * Handles connecting and disconnecting from game room, joining teams, leaving game
 */
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
    this.logger.log(
      `Client connected in game room: ${client.data.user.userName}`,
    );

    const { gameId } = client.handshake.query as {
      gameId: string;
    };
    client.data.gameId = gameId;

    // Fetch and send missed messages
    const lastMessageId = client.handshake.auth.serverOffset ?? 0;
    this.logger.debug('serverOffset: ', lastMessageId);
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

    try {
      if (this.gameRoomService.isGameStarted(gameId)) {
        this.gameMechanicsService.handlePlayerReconnect(client, this.gameRoom);
      } else {
        this.gameRoomService.handleUserConnectToGameRoom(client, this.gameRoom);
      }
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
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
    this.logger.log(
      `Client disconnected from game room: ${client.data.user.userName}`,
    );
    // if game is started, only remove socketId
    if (this.gameRoomService.isGameStarted(client.data.gameId)) {
      this.gameMechanicsService.handleDisconnectFromStartedGame(
        client,
        this.gameRoom,
      );
    } else {
      // else remove player from game, and delete his ActiveUser data
      this.gameRoomService.handleUserDisconnectFromGameRoom(
        client,
        this.gameRoom,
        this.lobby,
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
    this.logger.log(`User ${client.data.user.userName} leaving game room`);
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
    this.logger.log(`User ${client.data.user.userName} joining team: ${team}`);
    try {
      this.gameRoomService.joinTeam(team, client, this.gameRoom);
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }
  }

  /**
   * Handler to start game
   * Calls game mechanics service to start the game
   */
  @SubscribeMessage('game-room:start')
  @UseGuards(HostGuard, TooFewPlayersGuard)
  handleStartGame(@ConnectedSocket() client: Socket) {
    try {
      this.gameMechanicsService.startGame(client, this.gameRoom, this.lobby);
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('user-stats:get')
  async handleUserStatsGet(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userName }: { userName: string },
  ): Promise<void> {
    this.logger.log('User stats requested', userName);
    try {
      const userStats = await this.gameStateService.getUserStats(userName);
      client.emit('user-stats', userStats);
    } catch (error) {
      this.logger.error(error);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('chat:message')
  @UseGuards(GuessingTeamGuard)
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { message }: { message: string },
  ): Promise<void> {
    const { userName, userId } = client.data.user;
    const { gameId } = client.data;
    this.logger.log(`Chat message received: ${message}`);

    if (!this.gameRoomService.isGameStarted(gameId)) {
      const chatResponse = await this.chatService.handleChatMessage(
        userId,
        userName,
        gameId,
        message,
      );
      this.gameRoom.to(gameId).emit('chat:update', chatResponse);
      return;
    }

    const isDescriber = this.gameStateService.isDescriber(userId, gameId);
    const currentWord = this.gameStateService.getCurrentWord(gameId);
    if (isDescriber) {
      try {
        const isAllowed = validateDescriberMessage(currentWord, message);
        if (!isAllowed) {
          throw new Error('Message is not allowed');
        }
        const chatResponse = await this.chatService.handleChatMessage(
          userId,
          userName,
          gameId,
          message,
        );
        this.gameRoom.to(gameId).emit('chat:update', chatResponse);
      } catch (error) {
        this.logger.error(error);
        throw new WsException(error.message);
      }
    } else {
      const [validatedMessage, wordStatus] = checkGuessedWord(
        currentWord,
        message,
      );
      const chatResponse = await this.chatService.handleChatMessage(
        userId,
        userName,
        gameId,
        validatedMessage,
      );
      this.gameRoom.to(gameId).emit('chat:update', chatResponse);
      if (wordStatus === WordStatus.SIMILAR) {
        this.gameRoom.to(gameId).emit('chat:update', {
          userName: 'Server',
          message: `Your guess is close!`,
          time: new Date(),
        });
      } else if (wordStatus === WordStatus.GUESSED) {
        this.gameMechanicsService.playerGuessed(gameId, userId);
        this.gameRoom.to(gameId).emit('chat:update', {
          userName: 'Server',
          message: `Word guessed!`,
          time: new Date(),
        });
        this.logger.debug('Word guessed');
        this.gameMechanicsService.emitGameStartedUpdated(this.gameRoom, gameId);
      }
    }
  }
}
