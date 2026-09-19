import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // LOGIN
  // ==========================================

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto,
    );
  }

  // ==========================================
  // REGISTER
  // ==========================================

  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  // ==========================================
  // VERIFY EMAIL
  // ==========================================

  @Get('verify-email')
  verifyEmail(
    @Query('token') token: string,
  ) {
    return this.authService.verifyEmail(
      token,
    );
  }

  // ==========================================
  // RESEND VERIFICATION EMAIL
  // ==========================================

  @Post('resend-verification')
  resendVerificationEmail(
    @Body('email') email: string,
  ) {
    return this.authService.resendVerificationEmail(
      email,
    );
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  @Post('forgot-password')
  forgotPassword(
    @Body('email') email: string,
  ) {
    console.log(
      'FORGOT PASSWORD EMAIL:',
      email,
    );

    return this.authService.forgotPassword(
      email,
    );
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(
      token,
      password,
    );
  }
}