import {
  createHash,
  randomBytes,
} from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // ==========================================
  // REGISTER
  // ==========================================

  async register(registerDto: RegisterDto) {
    const { name, email, password } =
      registerDto;

    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const verificationToken =
      randomBytes(32).toString('hex');

    const verificationTokenHash =
      createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    const verificationExpiresAt =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000,
      );

    const user =
      await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerificationTokenHash:
            verificationTokenHash,
          emailVerificationExpiresAt:
            verificationExpiresAt,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

    await this.emailService.sendVerificationEmail(
      email,
      name,
      verificationToken,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user,
    };
  }

  // ==========================================
  // VERIFY EMAIL
  // ==========================================

  async verifyEmail(token: string) {
    const tokenHash =
      createHash('sha256')
        .update(token)
        .digest('hex');

    const user =
      await this.prisma.user.findFirst({
        where: {
          emailVerificationTokenHash:
            tokenHash,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid verification token',
      );
    }

    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt <
        new Date()
    ) {
      throw new UnauthorizedException(
        'Verification token has expired',
      );
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    return {
      message:
        'Email verified successfully',
    };
  }

  // ==========================================
  // RESEND VERIFICATION EMAIL
  // ==========================================

  async resendVerificationEmail(
    email: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    if (user.emailVerified) {
      throw new BadRequestException(
        'Email is already verified',
      );
    }

    const verificationToken =
      randomBytes(32).toString('hex');

    const verificationTokenHash =
      createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    const verificationExpiresAt =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000,
      );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerificationTokenHash:
          verificationTokenHash,
        emailVerificationExpiresAt:
          verificationExpiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    );

    return {
      message:
        'Verification email sent successfully',
    };
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  async forgotPassword(email: string) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      return {
        message:
          'If the email exists, a password reset link has been sent.',
      };
    }

    const resetToken =
      randomBytes(32).toString('hex');

    const resetTokenHash =
      createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const resetExpiresAt =
      new Date(
        Date.now() +
          15 * 60 * 1000,
      );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetTokenHash:
          resetTokenHash,
        passwordResetExpiresAt:
          resetExpiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    );

    return {
      message:
        'If the email exists, a password reset link has been sent.',
    };
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  async resetPassword(
    token: string,
    password: string,
  ) {
    const tokenHash =
      createHash('sha256')
        .update(token)
        .digest('hex');

    const user =
      await this.prisma.user.findFirst({
        where: {
          passwordResetTokenHash:
            tokenHash,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired reset token',
      );
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt <
        new Date()
    ) {
      throw new UnauthorizedException(
        'Reset token has expired',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message:
        'Password reset successfully',
    };
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async login(loginDto: LoginDto) {
    const { email, password } =
      loginDto;

    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    // TEMPORARY LOGIN DEBUG
    // Never log password or password hash.
    console.log('LOGIN DEBUG:', {
      email,
      userFound: !!user,
      emailVerified:
        user?.emailVerified ?? null,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      );

    // TEMPORARY LOGIN DEBUG
    // Never log password or password hash.
    console.log('PASSWORD DEBUG:', {
      passwordValid: isPasswordValid,
    });

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}