import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room-dto';
import { JoinRoomDto } from './dto/join-room-dto';
import { InGameUser, MAX_USERS, Room, UserTeam } from './types';

//TODO: add error throwers
@Injectable()
export class LobbyService {
  private rooms: Room[] = [];

  createRoom(createRoomDto: CreateRoomDto, socketId: string): Room {
    const newHost: InGameUser = {
      id: createRoomDto.userId,
      socketId,
      name: createRoomDto.userName,
      isHost: true,
      team: UserTeam.NONE,
    };

    const newRoom = {
      id: Math.random().toString(36).substring(7),
      name: createRoomDto.roomName,
      users: [newHost],
      maxUsers: MAX_USERS,
      isGameStarted: false,
    };

    this.rooms.push(newRoom);

    console.log('Created new room:', newRoom);

    return newRoom;
  }

  findRoomById(roomId: string): Room | undefined {
    return this.rooms.find((room) => room.id === roomId);
  }

  findUserBySocketId(socketId: string, roomId: string): InGameUser | undefined {
    const room = this.findRoomById(roomId);

    if (room) {
      return room.users.find((user) => user.socketId === socketId);
    }
  }

  addUserToRoom(roomId: string, user: InGameUser): void {
    const room = this.findRoomById(roomId);

    if (room) {
      room.users.push(user);
      console.log(`added user ${user.name} to room ${roomId}`);
    }
  }

  getAllRooms(): Room[] {
    console.log('Fetching all rooms:', this.rooms);

    return this.rooms;
  }

  deleteRoom(roomId: string): void {
    this.rooms = this.rooms.filter((room) => room.id !== roomId);

    console.log(`Deleted room ${roomId}`);
  }

  removeUserFromRoom(roomId: string, socketId: string): void {
    const room = this.findRoomById(roomId);

    if (room) {
      // delete room if only one user is left
      if (room.users.length === 1) {
        this.deleteRoom(roomId);
        return;
      }

      const user = room.users.find((user) => user.socketId === socketId);

      // if user is host, move host to first user
      if (user?.isHost) {
        room.users = room.users.filter((user) => user.socketId !== socketId);
        room.users[0].isHost = true;
        console.log(`Removed host ${socketId} from room ${roomId}`);
        console.log(`New host is ${room.users[0].id}`);
        return;
      }

      room.users = room.users.filter((user) => user.socketId !== socketId);

      console.log(`Removed user ${socketId} from room ${roomId}`);
    }
  }
}
