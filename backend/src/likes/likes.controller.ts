import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
  ) {}

  // ==========================================
  // LIKE / UNLIKE POST
  // POST /posts/:id/like
  // ==========================================

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.likesService.toggleLike(
      id,
      req.user.userId,
    );
  }

  // ==========================================
  // CHECK LIKE STATUS
  // GET /posts/:id/like-status
  // ==========================================

  @Get(':id/like-status')
  @UseGuards(JwtAuthGuard)
  getLikeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.likesService.getLikeStatus(
      id,
      req.user.userId,
    );
  }
}