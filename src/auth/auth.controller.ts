import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwtAuthGuard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

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
    return { valid: true }; // Return a simple response if the token is valid
  }

  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  googleLogin(){

  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
  
    // Set isOAuthUser to true when logging in via OAuth
    const tokens = await this.authService.login(user.username, user.password, true);
  
    // Redirect to frontend with the access token
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/?token=${tokens.accessToken}&userId=${user._id}&userName=${user.username}`);
  }
}
