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
  @Render('home')
  home() {
    return {};
  }

  @Get('lobby')
  @Render('lobby')
  getLobby() {
    return {};
  }

  // @Get('new-lobby-test')
  // @Render('new-lobby-test')
  // getNewLobbyTest() {
  //   return {};
  // }

  // @Get('new-game/:gameId')
  // @Render('new-game-room')
  // getNewGame(@Param('gameId') gameId: string) {
  //   return { gameId }; // Return game ID for rendering
  // }

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

  @Get('register')
  @Render('register')
  registerPage() {
    return {};
  }

  @Get('dashboard')
  @Render('dashboard')
  dashboard() {
    return {};
  }
}
