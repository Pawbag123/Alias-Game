import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Stats } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async signup(username: string, password: string) {
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('This user already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ username, password: hashedPassword });
    const savedUser = await newUser.save();

    const tokens = await this.generateTokens(
      savedUser._id.toString(),
      savedUser.username,
    );
    await this.updateRefreshToken(
      savedUser._id.toString(),
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: { id: savedUser._id, username: savedUser.username },
    };
  }

  async login(username: string, password: string, isOAuthUser = false) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    // Skip password validation for OAuth users
    if (!isOAuthUser) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password');
      }
    }
  
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.username,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
  
    return {
      ...tokens,
      user: { id: user._id, username: user.username },
    };
  }
  async generateTokens(userId: string, userName: string) {
    const payload = { userId, userName };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '3d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(
        user._id.toString(),
        user.username,
      );
      await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyValidToken(token: string) {
    const result = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    return result;
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }
  
  async createUser(userData: { username: string; password: string; stats: Stats }): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async validateGoogleUser(google: CreateUserDto){
    const user = await this.userModel.findOne({username: google.username})
    if(user) return user;
  }
}
