import { Test, TestingModule } from '@nestjs/testing';
import { GameRoomService } from './game-room.service';
import { GameStateService } from '../game-state/game-state.service';
import { Namespace, Socket } from 'socket.io';
import { Team } from 'src/types';
import { InLobbyGameDto } from 'src/lobby/dto/in-lobby-game-dto';
import { GameRoomDto } from './dto/game-room-dto';

describe('GameRoomService', () => {
  let service: GameRoomService;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameRoomService,
        {
          provide: GameStateService,
          useValue: {
            clearUserTimeout: jest.fn(),
            getActiveUserById: jest.fn(),
            getSerializedGameRoom: jest.fn(),
            gameExists: jest.fn(),
            isGameStarted: jest.fn(),
            handleUserRemove: jest.fn(),
            movePlayerToTeam: jest.fn(),
            getSerializedGames: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameRoomService>(GameRoomService);
    gameStateService = module.get<GameStateService>(GameStateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPlayerToGame', () => {
    it('should add player to game and set socketId', () => {
      const id = 'user1';
      const socketId = 'socket1';
      const gameId = 'game1';

      const mockUser = {
        id: 'user1',
        socketId: 'socket1',
        gameId: 'game1',
      };

      jest.spyOn(gameStateService, 'getActiveUserById').mockReturnValue(mockUser);

      service.addPlayerToGame(gameId, id, socketId);

      expect(gameStateService.clearUserTimeout).toHaveBeenCalledWith(id);
      expect(mockUser.socketId).toBe(socketId);
    });
  });

  describe('handleUserConnectToGameRoom', () => {
    it('should handle user connection and update game room', () => {
      const mockClient = {
        data: {
          gameId: 'game1',
          user: { userName: 'testUser', userId: 'user1' },
        },
        id: 'socket1',
        join: jest.fn(),
        broadcast: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      } as unknown as Socket;
  
      const mockNamespace = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as Namespace;
  
      const mockUser = {
        id: 'user1',
        socketId: 'socket1',
        gameId: 'game1',
      };
  
      jest.spyOn(gameStateService, 'getActiveUserById').mockReturnValue(mockUser);
      jest.spyOn(gameStateService, 'getSerializedGameRoom').mockReturnValue({
        id: 'game1',
        name: 'Test Game',
        host: 'user1',
        redTeam: ['user1'],
        blueTeam: [],
      });
  
      service.handleUserConnectToGameRoom(mockClient, mockNamespace);
  
      expect(mockClient.join).toHaveBeenCalledWith('game1');
      expect(mockNamespace.emit).toHaveBeenCalledWith(
        'game-room:updated',
        expect.anything(),
      );
      expect(mockClient.broadcast.emit).toHaveBeenCalledWith(
        'chat:update',
        expect.objectContaining({
          userName: 'Server',
          message: 'testUser has joined the room',
        }),
      );
    });
  });
  
  describe('handleUserDisconnectFromGameRoom', () => {
    it('should handle user disconnection and update game room', () => {
      const mockClient = {
        data: {
          gameId: 'game1',
          user: { userId: 'user1' },
        },
      } as unknown as Socket;
  
      const mockGameRoom = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as Namespace;
  
      const mockLobby = {
        emit: jest.fn(),
      } as unknown as Namespace;
  
      jest.spyOn(gameStateService, 'getActiveUserById').mockReturnValue({
        id: 'user1',
        gameId: 'game1',
        socketId: 'socket1',
      });
  
      jest.spyOn(gameStateService, 'gameExists').mockReturnValue(true);
  
      jest.spyOn(gameStateService, 'getSerializedGameRoom').mockReturnValue({
        id: 'game1',
        name: 'Test Game',
        host: 'user1',
        redTeam: ['user1'],
        blueTeam: [],
      } as GameRoomDto);
  
      jest.spyOn(gameStateService, 'getSerializedGames').mockReturnValue([
        {
          id: 'game1',
          name: 'Test Game',
          players: 1,
          maxPlayers: 4,
          started: false,
        },
      ] as InLobbyGameDto[]);
  
      service.handleUserDisconnectFromGameRoom(mockClient, mockGameRoom, mockLobby);
  
      expect(gameStateService.handleUserRemove).toHaveBeenCalledWith('user1', 'game1');
      expect(mockGameRoom.emit).toHaveBeenCalledWith('game-room:updated', expect.anything());
      expect(mockLobby.emit).toHaveBeenCalledWith('games:updated', expect.anything());
    });
  });
  
  
  describe('joinTeam', () => {
    it('should move player to a new team and update the game room', () => {
      const mockClient = {
        data: {
          gameId: 'game1',
          user: { userId: 'user1' },
        },
      } as unknown as Socket;
  
      const mockGameRoom = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as Namespace;
  
      const team = 'RED' as Team.RED;
  
      jest.spyOn(gameStateService, 'getSerializedGameRoom').mockReturnValue({
        id: 'game1',
        name: 'Test Game',
        host: 'user1',
        redTeam: ['user1'],
        blueTeam: [],
      });
  
      service.joinTeam(team, mockClient, mockGameRoom);
  
      expect(gameStateService.movePlayerToTeam).toHaveBeenCalledWith('user1', 'game1', team);
      expect(mockGameRoom.emit).toHaveBeenCalledWith('game-room:updated', expect.anything());
    });
  });
  

  describe('isGameStarted', () => {
    it('should return true if the game is started', () => {
      jest.spyOn(gameStateService, 'gameExists').mockReturnValue(true);
      jest.spyOn(gameStateService, 'isGameStarted').mockReturnValue(true);

      const result = service.isGameStarted('game1');

      expect(result).toBe(true);
    });

    it('should return false if the game does not exist', () => {
      jest.spyOn(gameStateService, 'gameExists').mockReturnValue(false);

      const result = service.isGameStarted('game1');

      expect(result).toBe(false);
    });
  });
});
