import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { GameStateService } from 'src/game-state/game-state.service';

import { Team, WORDS_TO_GUESS, WordStatus } from 'src/types';
import { validateDescriberMessage } from 'src/utils/describe-validation';
import { checkGuessedWord } from 'src/utils/guess-validation';

@Injectable()
export class GameMechanicsService {
  private readonly logger = new Logger(GameMechanicsService.name);

  constructor(private readonly gameStateService: GameStateService) {
    this.logger.log('GameMechanicsService created');
  }

  startGame(client: Socket, gameRoom: Namespace, lobby: Namespace): void {
    const { gameId } = client.data;
    this.logger.log(`Starting game ${gameId}`);
    this.gameStateService.setGameStarted(gameId);
    this.countdown(gameId, gameRoom).then(() => {
      lobby.emit('games:updated', this.gameStateService.getSerializedGames());
      this.handleTurns(gameId, gameRoom, lobby);
    });
  }

  async countdown(gameId: string, gameRoom: Namespace): Promise<void> {
    for (let i = 3; i > 0; i--) {
      gameRoom.to(gameId).emit('countdown', i);
      await this.delay(1000); // Wait for 1 second before next update
      if (i === 1) gameRoom.to(gameId).emit('end:countdown');
    }
  }

  private async handleTurns(
    gameId: string,
    gameRoom: Namespace,
    lobby: Namespace,
  ) {
    const game = this.gameStateService.getGameById(gameId);
    const totalRounds = game.settings.rounds;
    const time = game.settings.time;
    let currentRound = 0;

    while (currentRound < totalRounds) {
      this.newWord(gameId); // Generate a new word
      this.nextTurn(gameId); // Handles both game initialization and next turn

      this.emitGameStartedUpdated(gameRoom, gameId);
      // this.logger.debug(`STATE NUMBER ${rounds}`, turn);
      // this.logger.debug('current word', currentWord);

      await this.startTimer(gameId, time, gameRoom);
      const { turn, currentWord } = this.gameStateService.getGameById(gameId);
      gameRoom.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `${turn.describerName} ran out of time. The word was "${currentWord}"`,
        time: new Date(),
      });
      currentRound++;
    }

    gameRoom
      .to(gameId)
      .emit('game:end', this.gameStateService.getSerializedGameStarted(gameId));

    this.gameStateService.endGame(gameId);
    // Disconnect all sockets connected to room gameId
    const sockets = await gameRoom.in(gameId).fetchSockets();
    sockets.forEach((socket) => socket.disconnect());
    lobby.emit('games:updated', this.gameStateService.getSerializedGames());
  }

  private async startTimer(
    gameId: string,
    duration: number,
    gameRoom: Namespace,
  ) {
    for (let remaining = duration; remaining >= 0; remaining--) {
      gameRoom.to(gameId).emit('timer:update', { remaining });
      await this.delay(1000); // Wait for 1 second before next update
    }
  }
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reconnectPlayer(userId: string, gameId: string, socketId: string): void {
    this.logger.log(`Reconnecting user ${userId} to game ${gameId}`);
    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new ForbiddenException('User not allowed to join game');
    }
    if (user.gameId !== gameId) {
      throw new ForbiddenException('User not added to this game');
    }
    if (user.socketId) {
      throw new ConflictException('User already in game');
    }
    this.gameStateService.addPlayerSocketId(userId, socketId);
  }

  generateWord(wordsUsed: string[]): string {
    const words = WORDS_TO_GUESS;

    let selectedWord: string;

    do {
      const wordIndex = this.getRandomNumber(0, words.length - 1);
      selectedWord = words[wordIndex];
    } while (wordsUsed.includes(selectedWord));
    wordsUsed.push(selectedWord);
    return selectedWord;
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  nextTurn(gameId: string) {
    this.logger.log(`Next turn for game ${gameId}`);
    const game = this.gameStateService.getGameById(gameId);

    // Initialize game and set the first turn if it's not already set
    if (!game.turn) {
      const teamPlayers = game.players.filter(
        (player) => player.team === Team.RED || player.team === Team.BLUE,
      );

      // Randomly pick a player from the teamPlayers array
      const randomIndex = Math.floor(Math.random() * teamPlayers.length);
      const randomPlayer = teamPlayers[randomIndex];

      game.turn = {
        alreadyDescribed: [],
        team: randomPlayer.team,
        describerId: randomPlayer.userId,
        describerName: randomPlayer.name,
      };

      // Optionally set the first word
      // game.currentWord = this.generateWord(game.wordsUsed);
    } else {
      // Existing turn logic for subsequent turns
      game.turn.alreadyDescribed.push(game.turn.describerId);

      // Switch team
      const oppositeTeam = game.turn.team === Team.RED ? Team.BLUE : Team.RED;
      game.turn.team = oppositeTeam;

      const nextDescriber = game.players.find(
        (player) =>
          player.team === oppositeTeam &&
          !game.turn.alreadyDescribed.includes(player.userId),
      );

      if (nextDescriber) {
        game.turn.describerId = nextDescriber.userId;
        game.turn.describerName = nextDescriber.name;
      } else {
        game.turn.alreadyDescribed = game.turn.alreadyDescribed.filter(
          (playerId) =>
            game.players.some(
              (player) =>
                player.userId === playerId && player.team !== oppositeTeam,
            ),
        );

        const fallbackDescriber = game.players.find(
          (player) => player.team === oppositeTeam,
        );
        game.turn.describerId = fallbackDescriber?.userId || '';
        game.turn.describerName = fallbackDescriber?.name || '';
      }
    }

    this.gameStateService.saveCurrentState(game);
    return game;
  }

  newWord(gameId: string) {
    const game = this.gameStateService.getGameById(gameId);

    // if (game.currentWord) {
    //   game.wordsUsed.push(game.currentWord);
    // }
    game.currentWord = this.generateWord(game.wordsUsed);
    this.logger.debug('new word : ', game.currentWord);
    this.gameStateService.saveCurrentState(game);
  }

  playerGuessed(gameId: string, userId: string) {
    const game = this.gameStateService.getGameById(gameId);
    const { turn, score, players } = game;

    const guessingPlayer = players.find((player) => player.userId === userId);
    if (guessingPlayer) {
      guessingPlayer.inGameStats.wordsGuessed += 1;
    }

    const describer = players.find(
      (player) => player.userId === turn.describerId,
    );
    if (describer) {
      describer.inGameStats.wellDescribed += 1;
    }

    if (turn.team === 'redTeam') {
      score.red++;
    } else if (turn.team === 'blueTeam') {
      score.blue++;
    }

    this.newWord(gameId);
    this.gameStateService.saveCurrentState(game);
    return game;
  }

  emitGameStartedUpdated(gameRoom: Namespace, gameId: string) {
    const describerSocket = gameRoom.sockets.get(
      this.gameStateService.getDescriberSocketId(gameId),
    );

    if (!describerSocket) {
      gameRoom
        .to(gameId)
        .emit(
          'game-started:updated',
          this.gameStateService.getSerializedGameStarted(gameId),
        );
      return;
    }
    gameRoom
      .to(gameId)
      .except(describerSocket.id)
      .emit(
        'game-started:updated',
        this.gameStateService.getSerializedGameStarted(gameId),
      );

    describerSocket.emit(
      'game-started:updated',
      this.gameStateService.getSerializedGameStarted(gameId, true),
    );
  }

  handleDisconnectFromStartedGame(client: Socket, gameRoom: Namespace): void {
    const {
      gameId,
      user: { userId },
    } = client.data;
    this.gameStateService.removePlayerSocketId(userId);
    this.emitGameStartedUpdated(gameRoom, gameId);
    gameRoom.to(gameId).emit('chat:update', {
      userName: 'Server',
      message: `${client.data.user.userName} has disconnected`,
      time: new Date(),
    });
  }

  handlePlayerReconnect(client: Socket, gameRoom: Namespace): void {
    const {
      gameId,
      user: { userId, userName },
    } = client.data;
    this.reconnectPlayer(userId, gameId, client.id);
    client.join(gameId);
    this.emitGameStartedUpdated(gameRoom, gameId);
    client.broadcast.to(gameId).emit('chat:update', {
      userName: 'Server',
      message: `${userName} has reconnected`,
      time: new Date(),
    });
  }

  async handleGuessingPlayerMessage(
    currentWord: string,
    message: string,
    chatService: ChatService,
    client: Socket,
    gameRoom: Namespace,
  ): Promise<void> {
    const {
      gameId,
      user: { userId, userName },
    } = client.data;
    const [validatedMessage, wordStatus] = await checkGuessedWord(
      currentWord,
      message,
    );
    const chatResponse = await chatService.handleChatMessage(
      userId,
      userName,
      gameId,
      validatedMessage,
    );

    gameRoom.to(gameId).emit('chat:update', chatResponse);
    if (wordStatus === WordStatus.SIMILAR) {
      gameRoom.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `Your guess is close!`,
        time: new Date(),
      });
    } else if (wordStatus === WordStatus.GUESSED) {
      this.playerGuessed(gameId, userId);
      gameRoom.to(gameId).emit('chat:update', {
        userName: 'Server',
        message: `Word guessed!`,
        time: new Date(),
      });
      this.emitGameStartedUpdated(gameRoom, gameId);
    }
  }

  isDescriber(userId: string, gameId: string): boolean {
    return this.gameStateService.isDescriber(userId, gameId);
  }

  getCurrentWord(gameId: string): string {
    return this.gameStateService.getCurrentWord(gameId);
  }

  async handleDescriberMessage(
    currentWord: string,
    message: string,
    chatService: ChatService,
    client: Socket,
    gameRoom: Namespace,
  ): Promise<void> {
    const {
      gameId,
      user: { userId, userName },
    } = client.data;
    const isAllowed = validateDescriberMessage(currentWord, message);
    if (!isAllowed) {
      throw new ForbiddenException('Message contains described word');
    }
    const chatResponse = await chatService.handleChatMessage(
      userId,
      userName,
      gameId,
      message,
    );
    gameRoom.to(gameId).emit('chat:update', chatResponse);
  }

  async getUserStats(userName: string, client: Socket) {
    const userStats = await this.gameStateService.getUserStats(userName);
    client.emit('user-stats', userStats);
  }
}
