import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { LobbyModule } from './lobby/lobby.module';
import { LobbyService } from './lobby/lobby.service';
import { LobbyGateway } from './lobby/lobby.gateway';
import { GameRoomModule } from './game-room/game-room.module';
import { GameRoomGateway } from './game-room/game-room.gateway';
import { GameRoomService } from './game-room/game-room.service';
import { GameStateModule } from './shared/game-state.module';
import { GameStateService } from './shared/game-state.service';
import { GameMechanicsService } from './game-room/game-mechanics.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    LobbyModule,
    GameRoomModule,
    GameStateModule,
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LobbyService,
    GameRoomService,
    LobbyGateway,
    GameRoomGateway,
    GameStateService,
    GameMechanicsService,
  ],
})
export class AppModule {}
