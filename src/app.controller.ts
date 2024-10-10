import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller()
export class AppController {
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
}
