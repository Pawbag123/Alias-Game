import { Controller, Get, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { LobbyService } from './lobby/lobby.service';

interface Room {
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
    // const rooms: Room[] = this.lobbyService.getAllRooms();
    // console.log('Rendering lobby with rooms:', rooms);
    // return { rooms }
    return {};
  }

  @Get('room/:roomId')
  @Render('room')
  getRoom(@Param('roomId') roomId: string) {
    return { roomId }; // Return room ID for rendering
  }
}
