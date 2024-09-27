import { Injectable } from '@nestjs/common';

interface Room {
  id: string;
}

@Injectable()
export class LobbyService {
  private rooms: Room[] = [];

  createRoom(): Room {
    const newRoom = { id: Math.random().toString(36).substring(7) };
    this.rooms.push(newRoom);
    console.log('Created new room:', newRoom);
    return newRoom;
  }

  getAllRooms(): Room[] {
    console.log('Fetching all rooms:', this.rooms);
    return this.rooms;
  }
}
