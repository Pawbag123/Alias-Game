import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbyModule } from './lobby/lobby.module';
import { LobbyService } from './lobby/lobby.service';
import { LobbyGateway } from './lobby/lobby.gateway';
import { GameRoomModule } from './game-room/game-room.module';
import { GameRoomGateway } from './game-room/game-room.gateway';
import { GameRoomService } from './game-room/game-room.service';

@Module({
  imports: [LobbyModule, GameRoomModule],
  controllers: [AppController],
  providers: [
    AppService,
    LobbyService,
    GameRoomService,
    LobbyGateway,
    GameRoomGateway,
  ],
})
export class AppModule {}
