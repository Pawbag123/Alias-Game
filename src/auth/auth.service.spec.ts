import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

describe('AuthService', () => {
  let authService: AuthService;
  let mockJwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockJwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw a ConflictException if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({});

      await expect(
        authService.signup('existingUser', 'password'),
      ).rejects.toThrow(ConflictException);
    });

    //   it('should create a new user and return tokens', async () => {
    //     const mockTokens = {
    //       accessToken: 'mockAccessToken',
    //       refreshToken: 'mockRefreshToken',
    //     };

    //     mockUserModel.findOne.mockResolvedValue(null);

    //     const newUser = {
    //       _id: 'userId',
    //       username: 'existingUser',
    //       password: 'hashedPassword',
    //       save: jest.fn().mockResolvedValue({
    //         _id: 'userId',
    //         username: 'existingUser'
    //       }),
    //     };

    //     mockUserModel.prototype.save = newUser.save;

    //     jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);

    //     const result = await authService.signup('existingUser', 'password');

    //     expect(result).toEqual({
    //       accessToken: 'mockAccessToken',
    //       refreshToken: 'mockRefreshToken',
    //       user: { id: newUser._id, username: newUser.username },
    //     });
    //   });
  });
  //-------------
  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.login('nonExistentUser', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      mockUserModel.findOne.mockResolvedValue({
        _id: 'userId',
        username: 'existingUser',
        password: hashedPassword,
      });

      await expect(
        authService.login('existingUser', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful login', async () => {
      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      const hashedPassword = await bcrypt.hash('password', 10);
      mockUserModel.findOne.mockResolvedValue({
        _id: 'userId',
        username: 'existingUser',
        password: hashedPassword,
      });
      jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await authService.login('existingUser', 'password');

      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        user: { id: 'userId', username: 'existingUser' },
      });
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalidToken';
      jest.spyOn(mockJwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens on successful refresh', async () => {
      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };
      const refreshToken = 'validRefreshToken';
      const payload = { sub: 'userId', userName: 'existingUser' };

      jest.spyOn(mockJwtService, 'verify').mockReturnValue(payload);
      mockUserModel.findById.mockResolvedValue({
        _id: 'userId',
        username: 'existingUser',
        refreshToken: await bcrypt.hash(refreshToken, 10),
      });
      jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await authService.refresh(refreshToken);

      expect(result).toEqual(mockTokens);
    });
  });

  describe('verifyValidToken', () => {
    it('should verify the token', async () => {
      const token = 'validToken';
      const payload = { userId: 'userId', userName: 'existingUser' };

      jest.spyOn(mockJwtService, 'verify').mockReturnValue(payload);

      const result = await authService.verifyValidToken(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET,
      });
    });
  });
});
