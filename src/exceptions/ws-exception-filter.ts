import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient<Socket>();
    const errorMessage = exception.getError();
    console.log('WsExceptionFilter', errorMessage);
    client.emit('exception', { status: 'error', message: errorMessage });
  }
}
