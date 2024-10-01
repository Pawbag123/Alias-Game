import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { Game } from 'src/lobby/types';
import { InLobbyGameDto } from 'src/lobby/dto/in-lobby-game-dto';

@Injectable()
export class GameSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((games: Game[]) => {
        // Serialize each game object into InLobbyGameDto
        return games.map((game) =>
          plainToClass(InLobbyGameDto, {
            id: game.id,
            name: game.name,
            players:
              game.redTeam.length + game.blueTeam.length + game.noTeam.length,
            maxPlayers: game.maxUsers,
            started: game.isGameStarted,
          }),
        );
      }),
    );
  }
}
