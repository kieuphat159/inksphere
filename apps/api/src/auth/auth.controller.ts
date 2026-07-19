import {
  Controller,
  UseGuards,
  Request,
  Res,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res: Response) {
    const userData = await this.authService.login(req.user);
    const code = await this.authService.generateTempOAuthCode(userData);

    const baseUrl = FRONTEND_URL.endsWith('/')
      ? FRONTEND_URL.slice(0, -1)
      : FRONTEND_URL;
    res.redirect(`${baseUrl}/api/auth/google/callback?code=${code}`);
  }

  @Post('google/token')
  async exchangeCodeForToken(@Body() body: { code: string }) {
    return this.authService.exchangeOAuthCode(body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  verify() {
    return 'ok';
  }
}
