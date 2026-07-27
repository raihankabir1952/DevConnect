import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  // ==========================================
  // CREATE COMMENT
  // POST /comments
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard)
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.createComment(
      createCommentDto,
      req.user.userId,
    );
  }

  // ==========================================
  // GET COMMENT BY ID
  // GET /comments/:id
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.findOne(id);
  }

  // ==========================================
  // UPDATE COMMENT
  // PATCH /comments/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.updateComment(
      id,
      updateCommentDto,
      req.user.userId,
    );
  }

  // ==========================================
  // DELETE COMMENT
  // DELETE /comments/:id
  // ==========================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.commentsService.deleteComment(
      id,
      req.user.userId,
    );
  }
}