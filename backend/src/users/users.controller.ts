import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

import { UsersService } from './users.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  UpdateProfileDto,
} from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // SEARCH USERS
  // GET /users/search?name=Raihan
  // ==========================================

  @Get('search')
  searchUsers(
    @Query('name') name: string,
  ) {
    return this.usersService.searchUsers(name);
  }

  // ==========================================
  // UPDATE PROFILE
  // NAME + BIO
  // PATCH /users/profile
  // ==========================================

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,

    @Body()
    updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }

  // ==========================================
  // UPLOAD / CHANGE PROFILE IMAGE
  // PATCH /users/profile-image
  // ==========================================

  @Patch('profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      // ======================================
      // STORE FILE IN MEMORY
      // ======================================

      storage: memoryStorage(),

      // ======================================
      // FILE FILTER
      // Only image files allowed
      // ======================================

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {
          return callback(
            new BadRequestException(
              'Only image files are allowed',
            ),
            false,
          );
        }

        callback(
          null,
          true,
        );
      },

      // ======================================
      // FILE SIZE LIMIT
      // Maximum 5 MB
      // ======================================

      limits: {
        fileSize:
          5 * 1024 * 1024,
      },
    }),
  )
  async updateProfileImage(
    @UploadedFile()
    file: Express.Multer.File,

    @Req()
    req: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Profile image is required',
      );
    }

    return this.usersService.updateProfileImage(
      req.user.userId,
      file,
    );
  }

  // ==========================================
  // UPLOAD / CHANGE COVER IMAGE
  // PATCH /users/cover-image
  // ==========================================

  @Patch('cover-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      // ======================================
      // STORE FILE IN MEMORY
      // ======================================

      storage: memoryStorage(),

      // ======================================
      // FILE FILTER
      // Only image files allowed
      // ======================================

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {
          return callback(
            new BadRequestException(
              'Only image files are allowed',
            ),
            false,
          );
        }

        callback(
          null,
          true,
        );
      },

      // ======================================
      // FILE SIZE LIMIT
      // Maximum 5 MB
      // ======================================

      limits: {
        fileSize:
          5 * 1024 * 1024,
      },
    }),
  )
  async updateCoverImage(
    @UploadedFile()
    file: Express.Multer.File,

    @Req()
    req: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Cover image is required',
      );
    }

    return this.usersService.updateCoverImage(
      req.user.userId,
      file,
    );
  }

  // ==========================================
  // GET USER PROFILE
  // GET /users/:id
  // ==========================================

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usersService.findOne(id);
  }
}