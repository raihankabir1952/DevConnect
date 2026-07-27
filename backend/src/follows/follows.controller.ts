import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FollowsService } from './follows.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
  ) {}

  // ==========================================
  // FOLLOW USER
  // POST /users/:id/follow
  // ==========================================

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  followUser(
    @Param('id', ParseIntPipe)
    id: number,

    @Req() req: any,
  ) {
    return this.followsService.followUser(
      id,
      req.user.userId,
    );
  }

  // ==========================================
  // UNFOLLOW USER
  // DELETE /users/:id/follow
  // ==========================================

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollowUser(
    @Param('id', ParseIntPipe)
    id: number,

    @Req() req: any,
  ) {
    return this.followsService.unfollowUser(
      id,
      req.user.userId,
    );
  }

  // ==========================================
  // GET FOLLOWERS
  // GET /users/:id/followers
  // ==========================================

  @Get(':id/followers')
  getFollowers(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.followsService.getFollowers(
      id,
    );
  }

  // ==========================================
  // GET FOLLOWING
  // GET /users/:id/following
  // ==========================================

  @Get(':id/following')
  getFollowing(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.followsService.getFollowing(
      id,
    );
  }

  // ==========================================
  // CHECK FOLLOW STATUS
  // GET /users/:id/following-status
  // ==========================================

  @Get(':id/following-status')
  @UseGuards(JwtAuthGuard)
  checkFollowing(
    @Param('id', ParseIntPipe)
    id: number,

    @Req() req: any,
  ) {
    return this.followsService.checkFollowing(
      id,
      req.user.userId,
    );
  }
}