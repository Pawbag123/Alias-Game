import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbyModule } from './lobby/lobby.module';
import { LobbyService } from './lobby/lobby.service';
import { LobbyGateway } from './lobby/lobby.gateway';

@Module({
  imports: [LobbyModule],
  controllers: [AppController],
  providers: [AppService, LobbyService, LobbyGateway],
})
export class AppModule {}
