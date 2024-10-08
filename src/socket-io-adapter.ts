import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Server, ServerOptions, Socket } from 'socket.io';

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

    // const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    const tokenMiddleware = createTokenMiddleware(
      this.app.get(JwtService),
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
    });

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) => (socket: Socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    try {
      const decoded = jwtService.verify(token);
      logger.log('Decoded token', decoded);
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error('Error verifying token', error);
      next(new WsException('Unauthorized'));
    }
  };
