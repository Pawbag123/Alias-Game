import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { GameStateService } from './game-state/game-state.service';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: [
        `http://localhost:${process.env.PORT || 3000}`,
        new RegExp(
          `/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${process.env.PORT || 3000}$/`,
        ),
      ],
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const server: Server = super.createIOServer(port, optionsWithCORS);

    ['lobby', 'game-room'].forEach((namespace) => {
      server.of(namespace).use((socket, next) => {
        this.logger.log(
          `Socket trying to connect ${namespace} namespace`,
          socket.id,
        );

        next();
      });
      server
        .of(namespace)
        .use(createTokenMiddleware(this.app.get(JwtService), this.logger));
      server
        .of(namespace)
        .use(
          createSingleUserMiddleware(
            this.app.get(GameStateService),
            this.logger,
          ),
        );
    });

    server
      .of('game-room')
      .use(
        createAllowedToGameMiddleware(
          this.app.get(GameStateService),
          this.logger,
        ),
      );

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) => (socket: Socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    logger.log('Token middleware');
    if (!token) {
      logger.error('No token provided');
      return next(new Error('Unauthorized: User is not logged in'));
    }

    try {
      logger.debug('Token', token);
      const decoded = jwtService.verify(token);
      logger.debug('Decoded token', decoded);
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error('Error verifying token', error.message);
      return next(new Error('Unauthorized'));
    }
  };

const createSingleUserMiddleware =
  (gameStateService: GameStateService, logger: Logger) =>
  (socket: Socket, next) => {
    logger.log('Single user middleware');
    const user = socket.data.user;
    if (!user) {
      logger.error('No user in socket data');
      return next(new Error('Unauthorized'));
    }

    const activeUser = gameStateService.getActiveUserById(user.userId);
    if (activeUser && activeUser.socketId) {
      logger.error('User already connected');
      return next(new Error('Conflict'));
    }
    next();
  };

const createAllowedToGameMiddleware =
  (gameStateService: GameStateService, logger: Logger) =>
  (socket: Socket, next) => {
    logger.log('Allowed to game middleware');
    const { gameId } = socket.handshake.query as { gameId: string };
    const userId = socket.data.user.userId;

    if (!gameStateService.gameExists(gameId)) {
      logger.error('Game not found');
      return next(new Error('Not Found'));
    }

    if (!gameStateService.isUserAllowedInGame(userId, gameId)) {
      logger.error('User not allowed to join the game');
      return next(new Error('Forbidden'));
    }
    next();
  };
