import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // REGISTER
  // POST /auth/register
  // ==========================================

  async register(
    registerDto: RegisterDto,
  ) {
    const {
      name,
      email,
      password,
    } = registerDto;

    // Check if email already exists
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user =
      await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },

        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

    return {
      message:
        'Registration successful',

      user,
    };
  }

  // ==========================================
  // LOGIN
  // POST /auth/login
  // ==========================================

  async login(
    loginDto: LoginDto,
  ) {
    const {
      email,
      password,
    } = loginDto;

    // Find user
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    // User not found
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Compare password
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // JWT Payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate JWT
    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      message:
        'Login successful',

      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}