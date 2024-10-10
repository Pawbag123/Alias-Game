import { Injectable, Logger } from '@nestjs/common';

import { JOIN_TIMEOUT, MAX_USERS } from '../types';
import { GameStateService } from 'src/game-state/game-state.service';
import { Namespace, Socket } from 'socket.io';

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);

  constructor(private readonly gameStateService: GameStateService) {
    this.logger.log('LobbyService created');
  }

  /**
   * Handles logic for game creation:
   * - Create a new game
   * - Add the user data to the game (allow him to join)
   * - Set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
   * @returns id of created games
   */
  createGame(gameName: string, client: Socket, lobby: Namespace): void {
    const { userId, userName } = client.data.user;
    this.logger.log(`Creating game: ${gameName} by ${userName}`);

    //* Create a new game
    const gameId = this.gameStateService.createGame(
      gameName,
      userId,
      userName,
      MAX_USERS,
      JOIN_TIMEOUT,
      this.gameCreateHandler(lobby),
    );

    const games = this.gameStateService.getSerializedGames();

    client.emit('game:created', gameId);

    client.broadcast.emit('games:updated', games);
  }

  /**
   * Handles logic for joining a game:
   * - validate if user is already in a game
   * - find the game
   * - validate if the game is full
   * - add the user to the game (allow him to join)
   * - set a timeout to remove the user from the game if they don't join from the lobby in a certain amount of time
   * @param gameId - id of the game to join
   * @param userId - id of the user joining
   * @param userName - name of the user joining
   * @param emitGamesUpdated - function to emit updated games to all clients, works as a callback in timeout
   */
  joinGame(gameId: string, client: Socket, lobby: Namespace): void {
    const { userId, userName } = client.data.user;

    this.logger.log(`User ${userName} joining game: ${gameId}`);

    this.gameStateService.createJoinUser(
      userId,
      gameId,
      JOIN_TIMEOUT,
      this.gameJoinHandler(lobby),
    );

    this.gameStateService.addUserToGame(userId, userName, gameId);

    const games = this.gameStateService.getSerializedGames();

    client.emit('game:joined', gameId);

    client.broadcast.emit('games:updated', games);
  }

  handleConnection(client: Socket) {
    const { userId, userName } = client.data.user;

    this.logger.log(`Client connected to lobby: ${userName}`);

    const gameId = this.gameStateService.getGameOfUser(userId);
    if (gameId) {
      client.emit('game:joined', gameId);
      return;
    }

    const games = this.gameStateService.getSerializedGames();
    client.emit('games:updated', games);
    this.logger.log(`Emitting games: to client: ${userName}`, games);
  }

  private gameJoinHandler = (lobby: Namespace) => () => {
    const games = this.gameStateService.getSerializedGames();
    lobby.emit('games:updated', games);
  };

  private gameCreateHandler = (lobby: Namespace) => (gameId?: string) => {
    const games = this.gameStateService.getSerializedGames();
    lobby.emit('games:updated', games);
    if (gameId) {
      lobby.server
        .of('game-room')
        .to(gameId)
        .emit(
          'game-room:updated',
          this.gameStateService.getSerializedGameRoom(gameId),
        );
    }
  };

  getUserStats = async (client: Socket) => {
    const { userName } = client.data.user;
    this.logger.log('Getting user stats:', userName);
    try {
      const userStats = await this.gameStateService.getUserStats(userName);
      client.emit('user-stats', userStats);
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      throw new Error(error);
    }
  };
}
