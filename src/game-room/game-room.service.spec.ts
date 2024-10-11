import { Test, TestingModule } from '@nestjs/testing';
import { GameRoomService } from './game-room.service';
import { GameStateService } from '../game-state/game-state.service';
import { Team } from '../types';

describe('GameRoomService', () => {
  let gameRoomService: GameRoomService;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameRoomService,
        {
          provide: GameStateService,
          useValue: {
            gameExists: jest.fn(),
            isUserAllowedInGame: jest.fn(),
            getActiveUserById: jest.fn(),
            removePlayerFromGame: jest.fn(),
            removeActiveUser: jest.fn(),
            isGameHost: jest.fn(),
            isGameEmpty: jest.fn(),
            moveHostToNextUser: jest.fn(),
            removeGameRoom: jest.fn(),
            getGameById: jest.fn(),
            movePlayerToTeam: jest.fn(),
          },
        },
      ],
    }).compile();

    gameRoomService = module.get<GameRoomService>(GameRoomService);
    gameStateService = module.get<GameStateService>(GameStateService);
  });

  it('should be defined', () => {
    expect(gameRoomService).toBeDefined();
  });

  describe('addPlayerToGame', () => {
    it('should throw an error if the game does not exist', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(false);

      expect(() =>
        gameRoomService.addPlayerToGame('game-id', 'user-id', 'socket-id'),
      ).toThrow('Game not found');
    });

    it('should throw an error if the user is not allowed in the game', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.isUserAllowedInGame as jest.Mock).mockReturnValue(false);

      expect(() =>
        gameRoomService.addPlayerToGame('game-id', 'user-id', 'socket-id'),
      ).toThrow('User not allowed to join game');
    });

    it('should throw an error if the user is not found', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.isUserAllowedInGame as jest.Mock).mockReturnValue(true);
      (gameStateService.getActiveUserById as jest.Mock).mockReturnValue(null);

      expect(() =>
        gameRoomService.addPlayerToGame('game-id', 'user-id', 'socket-id'),
      ).toThrow('User not found');
    });

    it('should add player to the game', () => {
      const user = {
        socketId: null,
        gameId: 'game-id',
      };

      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.isUserAllowedInGame as jest.Mock).mockReturnValue(true);
      (gameStateService.getActiveUserById as jest.Mock).mockReturnValue(user);

      gameRoomService.addPlayerToGame('game-id', 'user-id', 'socket-id');

      expect(user.socketId).toBe('socket-id');
    });
  });

  describe('removePlayerFromGame', () => {
    it('should throw an error if the game does not exist', () => {
      (gameStateService.gameExists as jest.Mock).mockReturnValue(false);

      expect(() =>
        gameRoomService.removePlayerFromGame('game-id', 'user-id'),
      ).toThrow('Game not found');
    });

    it('should remove player from the game', () => {
      const user = { gameId: 'game-id' };

      (gameStateService.gameExists as jest.Mock).mockReturnValue(true);
      (gameStateService.getActiveUserById as jest.Mock).mockReturnValue(user);

      gameRoomService.removePlayerFromGame('game-id', 'user-id');

      expect(gameStateService.removePlayerFromGame).toHaveBeenCalledWith(
        'user-id',
        'game-id',
      );
      expect(gameStateService.removeActiveUser).toHaveBeenCalledWith('user-id');
    });
  });

  describe('joinRedTeam', () => {
    it('should throw an error if the game does not exist', () => {
      (gameStateService.getGameById as jest.Mock).mockReturnValue(null);

      expect(() =>
        gameRoomService.joinRedTeam('game-id', 'user-id'),
      ).toThrow('Game not found');
    });

    it('should move player to the red team', () => {
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isUserAllowedInGame as jest.Mock).mockReturnValue(true);
  
      gameRoomService.joinRedTeam('game-id', 'user-id');
  
      expect(gameStateService.movePlayerToTeam).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        Team.RED,
      );
    });
  });

  describe('joinBlueTeam', () => {
    it('should throw an error if the game does not exist', () => {
      (gameStateService.getGameById as jest.Mock).mockReturnValue(null);

      expect(() =>
        gameRoomService.joinBlueTeam('game-id', 'user-id'),
      ).toThrow('Game not found');
    });

    it('should move player to the blue team', () => {
      (gameStateService.getGameById as jest.Mock).mockReturnValue({});
      (gameStateService.isUserAllowedInGame as jest.Mock).mockReturnValue(true);
  
      gameRoomService.joinBlueTeam('game-id', 'user-id');
  
      expect(gameStateService.movePlayerToTeam).toHaveBeenCalledWith(
        'user-id',
        'game-id',
        Team.BLUE,
      );
    });
  });
});
