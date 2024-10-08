import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwtAuthGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.signup(
      createUserDto.username,
      createUserDto.password,
    );
    return {
      message: 'User created successfully',
      result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(
      loginUserDto.username,
      loginUserDto.password,
    );
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refresh(refreshTokenDto.refreshToken);
    return tokens;
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard) // Only allows requests with valid tokens
  async verifyToken() {
    console.log('guard::');

    return { valid: true }; // Return a simple response if the token is valid
  }
}
