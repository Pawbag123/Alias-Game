import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';
import { GameStateService } from '../game-state/game-state.service';
import { CreateGameDto } from './dto/create-game-dto';
import { JoinGameDto } from './dto/join-game-dto';
import { JOIN_TIMEOUT, MAX_USERS } from '../types';

describe('LobbyService', () => {
  let lobbyService: LobbyService;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyService,
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
          },
        },
      ],
    }).compile();

    lobbyService = module.get<LobbyService>(LobbyService);
    gameStateService = module.get<GameStateService>(GameStateService);
  });

  describe('createGame', () => {
    it('should create a game successfully', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.gameNameExists as jest.Mock).mockReturnValue(false);
      (gameStateService.createGame as jest.Mock).mockReturnValue('game-id');

      const createGameDto: CreateGameDto = {
        gameName: 'Test Game',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      const result = lobbyService.createGame(createGameDto, emitGamesUpdated);

      expect(result).toBe('game-id');
      expect(gameStateService.createGame).toHaveBeenCalledWith(
        'Test Game',
        'user-id',
        'Test User',
        MAX_USERS,
        JOIN_TIMEOUT,
        emitGamesUpdated,
      );
    });

    it('should throw an error if the user is already in a game', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(true);

      const createGameDto: CreateGameDto = {
        gameName: 'Test Game',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.createGame(createGameDto, emitGamesUpdated);
      }).toThrowError('User already in game');
    });

    it('should throw an error if the game name already exists', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.gameNameExists as jest.Mock).mockReturnValue(true);

      const createGameDto: CreateGameDto = {
        gameName: 'Test Game',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.createGame(createGameDto, emitGamesUpdated);
      }).toThrowError('Game of specified name already exists');
    });
  });

  describe('joinGame', () => {
    it('should join a game successfully', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isGameFull as jest.Mock).mockReturnValue(false);
      (gameStateService.isGameStarted as jest.Mock).mockReturnValue(false);

      const joinGameDto: JoinGameDto = {
        gameId: 'game-id',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      lobbyService.joinGame(joinGameDto, emitGamesUpdated);

      expect(gameStateService.createJoinUser).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        JOIN_TIMEOUT,
        emitGamesUpdated,
      );
      expect(gameStateService.addUserToGame).toHaveBeenCalledWith(
        'user-id',
        'Test User',
        'game-id',
      );
    });

    it('should throw an error if the user is already in a game', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(true);

      const joinGameDto: JoinGameDto = {
        gameId: 'game-id',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.joinGame(joinGameDto, emitGamesUpdated);
      }).toThrowError('User already in game');
    });

    it('should throw an error if the game is not found', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.getGameById as jest.Mock).mockReturnValue(null);

      const joinGameDto: JoinGameDto = {
        gameId: 'game-id',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.joinGame(joinGameDto, emitGamesUpdated);
      }).toThrowError('Game not found');
    });

    it('should throw an error if the game is full', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isGameFull as jest.Mock).mockReturnValue(true);

      const joinGameDto: JoinGameDto = {
        gameId: 'game-id',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.joinGame(joinGameDto, emitGamesUpdated);
      }).toThrowError('Game is full');
    });

    it('should throw an error if the game has already started', () => {
      (gameStateService.isUserActive as jest.Mock).mockReturnValue(false);
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isGameFull as jest.Mock).mockReturnValue(false);
      (gameStateService.isGameStarted as jest.Mock).mockReturnValue(true);

      const joinGameDto: JoinGameDto = {
        gameId: 'game-id',
        userId: 'user-id',
        userName: 'Test User',
      };
      const emitGamesUpdated = jest.fn();

      expect(() => {
        lobbyService.joinGame(joinGameDto, emitGamesUpdated);
      }).toThrowError('Game already started');
    });
  });
});
