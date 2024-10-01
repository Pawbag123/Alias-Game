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

  removePlayerFromGame(gameId: string, userId: string) {
    return this.lobbyService.removePlayerFromGame(gameId, userId);
  }

  gameExists(gameId: string) {
    return this.lobbyService.gameExists(gameId);
  }

  joinRedTeam(gameId: string, userId: string) {
    return this.lobbyService.joinRedTeam(gameId, userId);
  }

  joinBlueTeam(gameId: string, userId: string) {
    return this.lobbyService.joinBlueTeam(gameId, userId);
  }

  findUserBySocketId(socketId: string) {
    return this.lobbyService.findUserBySocketId(socketId);
  }

  //   getGameById(gameId: string) {
  //     return this.lobbyService.getGameById(gameId);
  //   }

  //   getActiveUserById(userId: string) {
  //     return this.lobbyService.getActiveUserById(userId);
  //   }
}
