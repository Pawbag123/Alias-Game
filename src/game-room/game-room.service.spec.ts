import { Test, TestingModule } from '@nestjs/testing';
import { GameRoomService } from './game-room.service';
import { GameStateService } from '../game-state/game-state.service';
import { Team } from '../types';
import {
  BroadcastOperator,
  DefaultEventsMap,
  Namespace,
  Socket,
} from 'socket.io';

describe('GameRoomService', () => {
  let gameRoomService: GameRoomService;
  let gameStateService: GameStateService;
  let client: Partial<Socket>;
  let gameRoom: Partial<Namespace>;
  let lobby: Partial<Namespace>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameRoomService,
        {
          provide: GameStateService,
          useValue: {
            gameExists: jest.fn(),
            getActiveUserById: jest.fn(),
            clearUserTimeout: jest.fn(),
            handleUserRemove: jest.fn(),
            movePlayerToTeam: jest.fn(),
            isGameStarted: jest.fn(),
            getSerializedGameRoom: jest.fn(),
            getSerializedGames: jest.fn(),
          },
        },
      ],
    }).compile();

    gameRoomService = module.get<GameRoomService>(GameRoomService);
    gameStateService = module.get<GameStateService>(GameStateService);

    client = {
      id: 'socket-id',
      data: {
        gameId: 'game-id',
        user: { userId: 'user-id', userName: 'Test User' },
      },
      join: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnThis(), // Allows chaining
        emit: jest.fn(),
        // Additional properties can be mocked as needed
        adapter: {}, // Optional: Mock other properties if necessary
        rooms: new Set(),
        exceptRooms: new Set(),
        flags: {},
      } as unknown as BroadcastOperator<DefaultEventsMap, any>, // Cast to the expected type
      emit: jest.fn(),
    };

    gameRoom = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    lobby = {
      emit: jest.fn(),
    };

    (gameStateService.getActiveUserById as jest.Mock).mockReturnValue({
      userId: 'user-id',
      socketId: null,
      gameId: 'game-id',
    });
    (gameStateService.getSerializedGameRoom as jest.Mock).mockReturnValue({});
    (gameStateService.movePlayerToTeam as jest.Mock).mockReturnValue(true);
  });

  describe('addPlayerToGame', () => {
    it('should add player to the game and update socketId', () => {
      const user = { socketId: null, gameId: 'game-id' };
      (gameStateService.getActiveUserById as jest.Mock).mockReturnValue(user);

      gameRoomService.addPlayerToGame('game-id', 'user-id', 'socket-id');

      expect(gameStateService.clearUserTimeout).toHaveBeenCalledWith('user-id');
      expect(user.socketId).toBe('socket-id');
    });
  });

  describe('handleUserConnectToGameRoom', () => {
    it('should add player to the game, emit game-room updates, and join game room', () => {
      gameRoomService.handleUserConnectToGameRoom(
        client as Socket,
        gameRoom as Namespace,
      );

      expect(gameStateService.getActiveUserById).toHaveBeenCalledWith(
        'user-id',
      );
      expect(client.join).toHaveBeenCalledWith('game-id');
      expect(gameRoom.emit).toHaveBeenCalledWith(
        'game-room:updated',
        expect.anything(),
      );
    });
  });

  describe('handleUserDisconnectFromGameRoom', () => {
    it('should remove user from game and emit game updates after disconnect', () => {
      const user = { gameId: 'game-id' };

      // Mock necessary game state methods
      (gameStateService.getActiveUserById as jest.Mock).mockReturnValue(user);
      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue({
        games: [], // Return something appropriate
      });

      // Call the method
      gameRoomService.handleUserDisconnectFromGameRoom(
        client as Socket,
        gameRoom as Namespace,
        lobby as Namespace,
      );

      // Check that handleUserRemove was called
      expect(gameStateService.handleUserRemove).toHaveBeenCalledWith(
        'user-id',
        'game-id',
      );

      // Ensure game-room and lobby emits are correct
      expect(gameRoom.emit).toHaveBeenCalledWith(
        'game-room:updated',
        expect.anything(),
      );
      expect(lobby.emit).toHaveBeenCalledWith(
        'games:updated',
        { games: [] }, // Match the mocked return value
      );
    });
  });

  describe('joinTeam', () => {
    it('should move player to the red team and emit game-room updates', () => {
      gameRoomService.joinTeam(
        Team.RED,
        client as Socket,
        gameRoom as Namespace,
      );

      expect(gameStateService.movePlayerToTeam).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        Team.RED,
      );
      expect(gameRoom.emit).toHaveBeenCalledWith(
        'game-room:updated',
        expect.anything(),
      );
    });

    it('should move player to the blue team and emit game-room updates', () => {
      gameRoomService.joinTeam(
        Team.BLUE,
        client as Socket,
        gameRoom as Namespace,
      );

      expect(gameStateService.movePlayerToTeam).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        Team.BLUE,
      );
      expect(gameRoom.emit).toHaveBeenCalledWith(
        'game-room:updated',
        expect.anything(),
      );
    });
  });

  describe('isGameStarted', () => {
    it('should return true if the game exists and has started', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.isGameStarted as jest.Mock).mockReturnValue(true);

      expect(gameRoomService.isGameStarted('game-id')).toBe(true);
    });

    it('should return false if the game does not exist or has not started', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(false);
      (gameStateService.isGameStarted as jest.Mock).mockReturnValue(false);

      expect(gameRoomService.isGameStarted('game-id')).toBe(false);
    });
  });
});
