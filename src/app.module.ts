import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameRoomModule } from './game-room/game-room.module';
import { GameStateModule } from './game-state/game-state.module';
import { ChatModule } from './chat/chat.module';
import googleOauthConfig from './auth/config/google-oauth.config';
import { GoogleStrategy } from './auth/stratergies/google.stratergy';

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
        uri: process.env.MONGO_URI || configService.get<string>('MONGO_URI'),
      }),
      
    }),
    ChatModule,
    ConfigModule.forFeature(googleOauthConfig)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GoogleStrategy
  ],
})
export class AppModule {}
