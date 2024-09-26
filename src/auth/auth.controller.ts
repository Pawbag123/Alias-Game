import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.CREATED)
  async signin(@Body() body: { username: string; password: string }) {
    const user = await this.authService.signin(body.username, body.password);
    return {
      message: 'User created successfully',
      user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    const token = await this.authService.login(body.username, body.password);
    return token;
  }
}
