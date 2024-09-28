import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby.service';
import { CreateRoomDto } from './dto/create-room-dto';
import { JoinRoomDto } from './dto/join-room-dto';
import { InGameUser, UserTeam } from './types';

//TODO: add error emitters, handlers, try catch blocks
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  //TODO: add leaving room logic
  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() createRoomDto: CreateRoomDto,
  ): void {
    // TODO: leaving logic if user is in other room
    // Create new room
    const newRoom = this.lobbyService.createRoom(createRoomDto, client.id);

    console.log('Room created:', newRoom);

    // join socket room
    client.join(newRoom.id);

    // Emit roomCreated event to the client that created the room
    client.emit('roomCreated', newRoom);

    console.log('Emitted roomCreated event for:', newRoom.id);

    const allRooms = this.lobbyService.getAllRooms();

    // Emit updated rooms list to all clients
    this.server.emit('updateRooms', allRooms);

    console.log('Emitted updated rooms list:', allRooms);
  }

  @SubscribeMessage('getRooms')
  handleGetRooms(@ConnectedSocket() client: Socket): void {
    const allRooms = this.lobbyService.getAllRooms();

    // Emit roomsList event to the client that requested rooms
    client.emit('roomsList', allRooms);

    console.log('Client requested rooms, sent rooms list:', allRooms);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ): void {
    const { roomId, userId, userName } = joinRoomDto;

    console.log(
      `Client ${userName} (${userId}) is attempting to join room: ${roomId}`,
    );
    // TODO: add leaving logic if user is in other room

    const room = this.lobbyService.findRoomById(roomId);

    // TODO: add validation if user is in the same room
    // validate if room exists
    if (!room) {
      client.emit('joinError', `Room ${roomId} not found`);
      console.log(`Room ${roomId} not found`);
      return;
    }

    // validate if room is full
    if (room.users.length >= room.maxUsers) {
      client.emit('joinError', `Room ${roomId} is full`);
      console.log(`Room ${roomId} is full`);
      return;
    }

    // Create new user
    const newUser: InGameUser = {
      id: userId,
      socketId: client.id,
      name: userName,
      isHost: false,
      team: UserTeam.NONE,
    };

    // Add user to room
    this.lobbyService.addUserToRoom(roomId, newUser);

    // Join socket room
    client.join(roomId);

    // Emit roomJoined event to the client that joined the room
    client.emit('roomJoined', room);

    // Emit updateRooms event to all clients
    this.server.emit('updateRooms', this.lobbyService.getAllRooms());

    // Emit updateRoom event to all remaining clients in the room
    client.broadcast.to(roomId).emit('updateRoom', room);

    console.log(`Client ${userName} (${userId}) joined room: ${roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): void {
    const user = this.lobbyService.findUserBySocketId(client.id, roomId);

    if (!user) {
      client.emit('leaveError', 'User not found');
      console.log('User not found');
      return;
    }

    const room = this.lobbyService.findRoomById(roomId);

    if (!room) {
      client.emit('leaveError', `Room ${roomId} not found`);
      console.log(`Room ${roomId} not found`);
      return;
    }

    // remove user from room data
    this.lobbyService.removeUserFromRoom(roomId, user.socketId);

    // leave socket room
    client.leave(roomId);

    // emit roomLeft event to the client that left the room
    client.emit('roomLeft', roomId);

    // broadcast updateRoom event to all remaining clients in the room
    client.broadcast.to(roomId).emit('updateRoom', room);

    // emit updateRooms event to all clients
    this.server.emit('updateRooms', this.lobbyService.getAllRooms());

    console.log(`Client ${user.name} (${user.id}) left room: ${roomId}`);
  }
}
