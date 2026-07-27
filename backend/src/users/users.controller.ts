import {
  BadRequestException,
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

import { diskStorage } from 'multer';

import { extname } from 'path';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  // UPLOAD / CHANGE PROFILE IMAGE
  // PATCH /users/profile-image
  // ==========================================

  @Patch('profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:
          './uploads/profile-images',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(
              file.originalname,
            )}`;

          callback(
            null,
            uniqueName,
          );
        },
      }),

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
    // ========================================
    // CHECK FILE
    // ========================================

    if (!file) {
      throw new BadRequestException(
        'Profile image is required',
      );
    }

    // ========================================
    // UPDATE PROFILE IMAGE
    // ========================================

    return this.usersService.updateProfileImage(
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