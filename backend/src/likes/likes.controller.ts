import {
  Controller,
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.likesService.toggleLike(
      id,
      req.user.userId,
    );
  }
}