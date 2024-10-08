import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Server, ServerOptions, Socket } from 'socket.io';
import { GameStateService } from './game-state/game-state.service';

const CLIENT_PORT = 3000;

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
        `http://localhost:${CLIENT_PORT}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${CLIENT_PORT}$/`),
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

    const tokenMiddleware = createTokenMiddleware(
      this.app.get(JwtService),
      this.logger,
    );

    const singleUserMiddleware = createSingleUserMiddleware(
      this.app.get(GameStateService),
      this.logger,
    );

    const allowedToGameMiddleware = createAllowedToGameMiddleware(
      this.app.get(GameStateService),
      this.logger,
    );

    ['lobby', 'game-room'].forEach((namespace) => {
      server.of(namespace).use((socket, next) => {
        this.logger.log(
          `Socket trying to connect ${namespace} namespace`,
          socket.id,
        );

        next();
      });
      server.of(namespace).use(tokenMiddleware);
      server.of(namespace).use(singleUserMiddleware);
    });

    server.of('game-room').use(allowedToGameMiddleware);

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) => (socket: Socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      logger.error('No token provided');
      return next(new WsException('Unauthorized'));
    }

    logger.debug('right before loop');
    try {
      logger.debug('Token', token);
      const decoded = jwtService.verify(token);
      logger.log('Decoded token', decoded);
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error('Error verifying token', error.message);
      return next(new WsException('Unauthorized'));
    }
  };

const createSingleUserMiddleware =
  (gameStateService: GameStateService, logger: Logger) =>
  (socket: Socket, next) => {
    logger.log('Single user middleware');
    const user = socket.data.user;
    if (!user) {
      logger.error('No user in socket data');
      return next(new WsException('Unauthorized'));
    }
    logger.debug('User', user);
    logger.debug('Games', gameStateService.getAllGames());
    logger.debug('Active users', gameStateService.getAllActiveUsers());
    const activeUser = gameStateService.getActiveUserById(user.userId);
    // logger.debug('Active user', activeUser);
    if (activeUser && activeUser.socketId) {
      logger.error('User already connected');
      return next(new WsException('User already connected'));
    }
    next();
  };

const createAllowedToGameMiddleware =
  (gameStateService: GameStateService, logger: Logger) =>
  (socket: Socket, next) => {
    logger.log('Allowed to game middleware');
    const { gameId, userId } = socket.handshake.query as {
      gameId: string;
      userId: string;
    };
    // if (!user) {
    //   logger.error('No user in socket data');
    //   next(new WsException('Unauthorized'));
    // }
    // logger.debug('User', user);
    // logger.debug('Games', gameStateService.getAllGames());
    // logger.debug('Active users', gameStateService.getAllActiveUsers());
    // const activeUser = gameStateService.getActiveUserById(user.userId);
    // logger.debug('Active user', activeUser);
    if (!gameStateService.isUserAllowedInGame(userId, gameId)) {
      logger.error('User not allowed to join the game');
      return next(new WsException('User not allowed to join the game'));
    }
    next();
  };
