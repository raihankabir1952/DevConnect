import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import { PostsService } from './posts.service';

import { CreatePostDto } from './dto/create-post.dto';

import { UpdatePostDto } from './dto/update-post.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  // ==========================================
  // CREATE POST
  // TEXT + OPTIONAL IMAGE
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/post-images',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(file.originalname)}`;

          callback(
            null,
            uniqueName,
          );
        },
      }),
    }),
  )
  create(
    @Body()
    createPostDto: CreatePostDto,

    @UploadedFile()
    file: Express.Multer.File,

    @Request()
    req: any,
  ) {
    return this.postsService.create(
      createPostDto,
      req.user.userId,
      file,
    );
  }

  // ==========================================
  // GET ALL POSTS
  // SEARCH + PAGINATION
  // ==========================================

  @Get()
  findAll(
    @Query('search')
    search?: string,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,
  ) {
    return this.postsService.findAll(
      search,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  // ==========================================
  // GET SINGLE POST
  // ==========================================

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.postsService.findOne(id);
  }

  // ==========================================
  // UPDATE OWN POST
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updatePostDto: UpdatePostDto,

    @Request()
    req: any,
  ) {
    return this.postsService.update(
      id,
      updatePostDto,
      req.user.userId,
    );
  }

  // ==========================================
  // DELETE OWN POST
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Request()
    req: any,
  ) {
    return this.postsService.remove(
      id,
      req.user.userId,
    );
  }
}
