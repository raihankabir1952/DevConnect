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
  UseGuards,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  // Create Post
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.create(
      createPostDto,
      req.user.userId,
    );
  }

  // Get All Posts
  // Search + Pagination
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findAll(
      search,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  // Get Single Post
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.findOne(id);
  }

  // Update Own Post
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.update(
      id,
      updatePostDto,
      req.user.userId,
    );
  }

  // Delete Own Post
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.postsService.remove(
      id,
      req.user.userId,
    );
  }
}