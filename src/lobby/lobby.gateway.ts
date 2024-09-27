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

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    const newRoom = this.lobbyService.createRoom();
    console.log('Room created:', newRoom); // Log room creation
    client.emit('roomCreated', newRoom);
    console.log('Emitted roomCreated event for:', newRoom.id); // Log emit

    const allRooms = this.lobbyService.getAllRooms();
    this.server.emit('updateRooms', allRooms);
    console.log('Emitted updated rooms list:', allRooms); // Log updated rooms list
  }

  @SubscribeMessage('getRooms')
  handleGetRooms(@ConnectedSocket() client: Socket): void {
    const allRooms = this.lobbyService.getAllRooms();
    client.emit('roomsList', allRooms);
    console.log('Client requested rooms, sent rooms list:', allRooms);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): void {
    console.log('Client joining room:', roomId);
    client.emit('roomJoined', roomId);
    // should add logic to join socket to room
    console.log('Emitted roomJoined event for room:', roomId);
  }
}
