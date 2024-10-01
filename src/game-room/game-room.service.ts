import { Injectable } from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';

@Injectable()
export class GameRoomService {
  constructor(private readonly lobbyService: LobbyService) {
    console.log('GameRoomService created');
  }

  addPlayerToGame(gameId: string, userId: string, socketId: string) {
    return this.lobbyService.addPlayerToGame(gameId, userId, socketId);
  }

  //   getGameById(gameId: string) {
  //     return this.lobbyService.getGameById(gameId);
  //   }

  //   getActiveUserById(userId: string) {
  //     return this.lobbyService.getActiveUserById(userId);
  //   }
}
