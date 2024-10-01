import { Controller, Get, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { LobbyService } from './lobby/lobby.service';

interface Game {
  id: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly lobbyService: LobbyService,
  ) {}

  @Get()
  @Render('lobby')
  getLobby() {
    // const games: Game[] = this.lobbyService.getAllGames();
    // console.log('Rendering lobby with games:', games);
    // return { games }
    return {};
  }

  @Get('game/:gameId')
  @Render('game-room')
  getGame(@Param('gameId') gameId: string) {
    return { gameId }; // Return game ID for rendering
  }
}
