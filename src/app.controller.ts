import { Controller, Get, Param, Render } from '@nestjs/common';

import { AppService } from './app.service';
import { LobbyService } from './lobby/lobby.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly lobbyService: LobbyService,
  ) {}

  @Get()
  @Render('lobby')
  getLobby() {
    return {};
  }
  // @Render('home')
  // home() {
  //   return {}

  @Get('game/:gameId')
  @Render('game-room')
  getGame(@Param('gameId') gameId: string) {
    return { gameId }; // Return game ID for rendering
  }

  @Get('login')
  @Render('login')
  loginPage() {
    return {};
  }

  @Get('dashboard')
  @Render('dashboard')
  dashboard() {
    return {};
  }
}
