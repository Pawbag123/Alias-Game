import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';
import { GameStateService } from '../game-state/game-state.service';
import { Namespace, Socket } from 'socket.io';
import { JOIN_TIMEOUT, MAX_USERS } from '../types';

describe('LobbyService', () => {
  let lobbyService: LobbyService;
  let gameStateService: GameStateService;
  let client: Socket;
  let lobby: Namespace;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyService,
        {
          provide: GameStateService,
          useValue: {
            createGame: jest.fn(),
            getSerializedGames: jest.fn(),
            createJoinUser: jest.fn(),
            addUserToGame: jest.fn(),
            getGameOfUser: jest.fn(),
            getSerializedGameRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    lobbyService = module.get<LobbyService>(LobbyService);
    gameStateService = module.get<GameStateService>(GameStateService);

    client = {
      data: {
        user: { userId: 'user-id', userName: 'Test User' },
      },
      emit: jest.fn(),
      broadcast: {
        emit: jest.fn(),
      },
    } as unknown as Socket;

    lobby = {
      emit: jest.fn(),
      server: {
        of: jest.fn().mockReturnThis(),
        to: jest.fn().mockReturnThis(),
      },
    } as unknown as Namespace;
  });

  describe('createGame', () => {
    it('should create a game and emit events correctly', () => {
      const gameId = 'game-id';
      (gameStateService.createGame as jest.Mock).mockReturnValue(gameId);
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.createGame('Test Game', client, lobby);

      expect(gameStateService.createGame).toHaveBeenCalledWith(
        'Test Game',
        'user-id',
        'Test User',
        MAX_USERS,
        JOIN_TIMEOUT,
        expect.any(Function),
      );
      expect(client.emit).toHaveBeenCalledWith('game:created', gameId);
      expect(client.broadcast.emit).toHaveBeenCalledWith('games:updated', []);
    });
  });

  describe('joinGame', () => {
    it('should join a game and emit events correctly', () => {
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.joinGame('game-id', client, lobby);

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
      expect(client.emit).toHaveBeenCalledWith('game:joined', 'game-id');
      expect(client.broadcast.emit).toHaveBeenCalledWith('games:updated', []);
    });
  });

  describe('handleConnection', () => {
    it('should handle client connection and emit game data', () => {
      (gameStateService.getGameOfUser as jest.Mock).mockReturnValue(null);
      (gameStateService.getSerializedGames as jest.Mock).mockReturnValue([]);

      lobbyService.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('games:updated', []);
    });

    it('should emit game:joined if user is already in a game', () => {
      const gameId = 'game-id';
      (gameStateService.getGameOfUser as jest.Mock).mockReturnValue(gameId);

      lobbyService.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('game:joined', gameId);
    });
  });
});
