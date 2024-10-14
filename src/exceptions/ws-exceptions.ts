import { WsException } from '@nestjs/websockets';
import { WsExceptionType } from 'src/types';

export class WsTypeException extends WsException {
  constructor(
    public readonly type: WsExceptionType,
    message: string | unknown,
  ) {
    const error = {
      type,
      message,
    };
    super(error);
  }
}

export class WsBadRequestException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.BadRequest, message);
  }
}

export class WsUnauthorizedException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.Unauthorized, message);
  }
}

export class WsForbiddenException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.Forbidden, message);
  }
}

export class WsNotFoundException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.NotFound, message);
  }
}

export class WsConflictException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.Conflict, message);
  }
}

export class WsInternalServerErrorException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.InternalServerError, message);
  }
}

export class WsUnknownException extends WsTypeException {
  constructor(message: string | unknown) {
    super(WsExceptionType.Unknown, message);
  }
}
