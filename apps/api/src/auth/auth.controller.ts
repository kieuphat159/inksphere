import { Controller, UseGuards, Request, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(GoogleAuthGuard)
    @Get("google/login")
    googleLogin() {}

    @UseGuards(GoogleAuthGuard)
    @Get("google/callback")
    async googleCallback(@Request() req, @Res() res: Response) {
        // console.log("Google callback", req.user);

        const userData = await this.authService.login(req.user);

        res.redirect(
            `${GOOGLE_CALLBACK_URL}?userId=${userData.id}&name=${userData.name}&avatar=${userData.avatar}&accessToken=${userData.accessToken}`
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get("verify-token")
    verify() {
        return 'ok';
    }
}
