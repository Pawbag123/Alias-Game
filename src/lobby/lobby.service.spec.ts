import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';
import { GameStateService } from '../game-state/game-state.service';
import { Logger } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';

import { JOIN_TIMEOUT, MAX_USERS } from '../types';

describe('LobbyService', () => {
  let lobbyService: LobbyService;
  let gameStateService: GameStateService;
  let mockSocket: Socket;
  let mockNamespace: Namespace;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyService,
        Logger,
        {
          provide: GameStateService,
          useValue: {
            isUserActive: jest.fn(),
            gameNameExists: jest.fn(),
            createGame: jest.fn(),
            getGameById: jest.fn(),
            isGameFull: jest.fn(),
            isGameStarted: jest.fn(),
            createJoinUser: jest.fn(),
            addUserToGame: jest.fn(),
            getSerializedGames: jest.fn(),
            getGameOfUser: jest.fn(),
            getSerializedGameRoom: jest.fn(),
            getUserStats: jest.fn(),
          },
        },
      ],
    }).compile();

    lobbyService = module.get<LobbyService>(LobbyService);
    gameStateService = module.get<GameStateService>(GameStateService);

    // Mocking Socket and Namespace for the tests
    mockSocket = {
      data: { user: { userId: 'user-id', userName: 'Test User' } },
      emit: jest.fn(),
      broadcast: { emit: jest.fn() },
    } as any as Socket;

    mockNamespace = {
      emit: jest.fn(),
      server: {
        of: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue({
            emit: jest.fn(),
          }),
        }),
      },
    } as any as Namespace;
  });

  describe('createGame', () => {
    it('should create a game successfully', () => {
      (gameStateService.createGame as jest.Mock).mockReturnValue('game-id');
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.createGame('Test Game', mockSocket, mockNamespace);

      expect(gameStateService.createGame).toHaveBeenCalledWith(
        'Test Game',
        'user-id',
        'Test User',
        MAX_USERS,
        JOIN_TIMEOUT,
        expect.any(Function),
      );

      expect(mockSocket.emit).toHaveBeenCalledWith('game:created', 'game-id');
      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith(
        'games:updated',
        [],
      );
    });
  });

  describe('joinGame', () => {
    it('should join a game successfully', () => {
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isGameFull as jest.Mock).mockReturnValue(false);
      (gameStateService.isGameStarted as jest.Mock).mockReturnValue(false);
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.joinGame('game-id', mockSocket, mockNamespace);

      expect(gameStateService.createJoinUser).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        JOIN_TIMEOUT,
        expect.any(Function),
      );
      expect(gameStateService.addUserToGame).toHaveBeenCalledWith(
        'user-id',
        'Test User',
        'game-id',
      );

      expect(mockSocket.emit).toHaveBeenCalledWith('game:joined', 'game-id');
      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith(
        'games:updated',
        [],
      );
    });
  });

  describe('handleConnection', () => {
    it('should emit joined game if user is already in a game', () => {
      (gameStateService.getGameOfUser as jest.Mock).mockReturnValue('game-id');

      lobbyService.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('game:joined', 'game-id');
    });

    it('should emit updated games if user is not in a game', () => {
      (gameStateService.getGameOfUser as jest.Mock).mockReturnValue(null);
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('games:updated', []);
    });
  });
});
