import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  WsBadRequestException,
  WsConflictException,
  WsForbiddenException,
  WsInternalServerErrorException,
  WsNotFoundException,
  WsUnauthorizedException,
  WsUnknownException,
} from './ws-exceptions';

@Catch()
export class WsAllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient();
    let wsException;
    console.log(exception);
    switch (true) {
      case exception instanceof BadRequestException:
        const exceptionData = exception.getResponse();
        wsException = new WsBadRequestException(
          exceptionData['message'] ?? 'Bad request',
        );
        break;

      case exception instanceof UnauthorizedException:
        wsException = new WsUnauthorizedException(exception.message);
        break;

      case exception instanceof ForbiddenException:
        wsException = new WsForbiddenException(exception.message);
        break;

      case exception instanceof NotFoundException:
        wsException = new WsNotFoundException(exception.message);
        break;

      case exception instanceof ConflictException:
        wsException = new WsConflictException(exception.message);
        break;

      case exception instanceof InternalServerErrorException:
        wsException = new WsInternalServerErrorException(exception.message);
        break;

      default:
        wsException = new WsUnknownException(exception.message);
    }

    socket.emit('exception', wsException);
  }
}
