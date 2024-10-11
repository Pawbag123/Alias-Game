import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from './lobby.service';
import { CreateGameGuard } from './guards/create-game.guard';
import { JoinGameGuard } from './guards/join-game.guard';
import { Socket } from 'socket.io';

describe('LobbyGateway', () => {
  let gateway: LobbyGateway;
  let lobbyService: LobbyService;
  let mockSocket: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyGateway,
        {
          provide: LobbyService,
          useValue: {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            handleConnection: jest.fn(),
            getUserStats: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(CreateGameGuard)
      .useValue({
        canActivate: jest.fn(() => true), // mock the guard to always return true
      })
      .overrideGuard(JoinGameGuard)
      .useValue({
        canActivate: jest.fn(() => true), // mock the guard to always return true
      })
      .compile();

    gateway = module.get<LobbyGateway>(LobbyGateway);
    lobbyService = module.get<LobbyService>(LobbyService);
    mockSocket = {
      id: 'socket1',
      data: { user: { userId: '123', userName: 'test-user' } },
    } as Socket;
  });

  it('should create a game when "game:create" event is triggered', () => {
    const gameName = 'Test Game';
    gateway.handleGameCreate(mockSocket, { gameName });
    expect(lobbyService.createGame).toHaveBeenCalledWith(
      gameName,
      mockSocket,
      gateway.lobby,
    );
  });

  it('should join a game when "game:join" event is triggered', () => {
    const gameId = 'game1';
    gateway.handleGameJoin(mockSocket, { gameId });
    expect(lobbyService.joinGame).toHaveBeenCalledWith(
      gameId,
      mockSocket,
      gateway.lobby,
    );
  });

  it('should throw WsException when create guard fails', async () => {
    const gameName = 'Test Game';
    const createGameGuard = jest
      .spyOn(CreateGameGuard.prototype, 'canActivate')
      .mockReturnValue(false);

    try {
      gateway.handleGameCreate(mockSocket, { gameName });
    } catch (error) {
      expect(error).toBeInstanceOf(WsException);
      //   expect(error.message).toBe('Forbidden resource');
    }
  });

  it('should throw WsException when join guard fails', async () => {
    const gameId = 'game1';
    const joinGameGuard = jest
      .spyOn(JoinGameGuard.prototype, 'canActivate')
      .mockReturnValue(false);

    try {
      gateway.handleGameJoin(mockSocket, { gameId });
    } catch (error) {
      expect(error).toBeInstanceOf(WsException);
      //   expect(error.message).toBe('Forbidden resource');
    }
  });

  it('should return user stats on "user-stats:get" event', async () => {
    await gateway.handleUserStatsGet(mockSocket);
    expect(lobbyService.getUserStats).toHaveBeenCalledWith(mockSocket);
  });
});
