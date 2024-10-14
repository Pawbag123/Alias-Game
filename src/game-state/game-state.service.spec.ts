import { Test, TestingModule } from '@nestjs/testing';
import { GameStateService } from './game-state.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import { Games } from '../game-room/schema/game.schema';
import { Team } from '../types';

describe('GameStateService', () => {
  let service: GameStateService;
  // let userModel: any;
  // let gamesModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameStateService,
        {
          provide: getModelToken(User.name),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Games.name),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameStateService>(GameStateService);
    // userModel = module.get(getModelToken(User.name));
    // gamesModel = module.get(getModelToken(Games.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    it('should create a new game and add the user as the host', () => {
      const gameName = 'Test Game';
      const userId = 'user123';
      const userName = 'Test User';
      const maxUsers = 4;
      const timeout = 30000;
      const timeoutCb = jest.fn();
      
      const gameId = service.createGame(gameName, userId, userName, maxUsers, timeout, timeoutCb);
      
      expect(gameId).toBeDefined();
      expect(service['games']).toHaveLength(1);
      expect(service['games'][0]).toMatchObject({
        name: gameName,
        host: userId,
        players: [{ userId, name: userName, team: Team.RED }],
      });
    });
  });

  describe('removePlayerFromGame', () => {
    it('should remove a player from the game', () => {
      const gameId = service.createGame('Test Game', 'user1', 'User One', 4, 30000, jest.fn());
      service.addUserToGame('user2', 'User Two', gameId);
      
      expect(service.getGameById(gameId).players).toHaveLength(2);
      
      service.removePlayerFromGame('user1', gameId);
      
      expect(service.getGameById(gameId).players).toHaveLength(1);
      expect(service.getGameById(gameId).players[0].userId).toBe('user2');
    });
  });

  describe('isUserAllowedInGame', () => {
    it('should return true if user is in game', () => {
      const gameId = service.createGame('Test Game', 'user1', 'User One', 4, 30000, jest.fn());
      service.addUserToGame('user2', 'User Two', gameId);
      
      expect(service.isUserAllowedInGame('user2', gameId)).toBe(true);
    });

    it('should return false if user is not in game', () => {
      const gameId = service.createGame('Test Game', 'user1', 'User One', 4, 30000, jest.fn());
      
      expect(service.isUserAllowedInGame('user2', gameId)).toBe(false);
    });
  });
});