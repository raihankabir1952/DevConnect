import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // FOLLOW USER
  // POST /users/:id/follow
  // ==========================================

  async followUser(
    followingId: number,
    followerId: number,
  ) {
    // Cannot follow yourself
    if (followingId === followerId) {
      throw new ConflictException(
        'You cannot follow yourself',
      );
    }

    // Check following user exists
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: followingId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    // Check if already following
    const existingFollow =
      await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

    if (existingFollow) {
      throw new ConflictException(
        'You are already following this user',
      );
    }

    // Create follow
    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return {
      message:
        'User followed successfully',
      following: true,
    };
  }

  // ==========================================
  // UNFOLLOW USER
  // DELETE /users/:id/follow
  // ==========================================

  async unfollowUser(
    followingId: number,
    followerId: number,
  ) {
    // Check if follow exists
    const existingFollow =
      await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

    if (!existingFollow) {
      throw new NotFoundException(
        'You are not following this user',
      );
    }

    // Delete follow
    await this.prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    return {
      message:
        'User unfollowed successfully',
      following: false,
    };
  }

  // ==========================================
  // GET FOLLOWERS
  // GET /users/:id/followers
  // ==========================================

  async getFollowers(
    userId: number,
  ) {
    // Check user exists
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const followers =
      await this.prisma.follow.findMany({
        where: {
          followingId: userId,
        },

        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return followers.map(
      (follow) => follow.follower,
    );
  }

  // ==========================================
  // GET FOLLOWING
  // GET /users/:id/following
  // ==========================================

  async getFollowing(
    userId: number,
  ) {
    // Check user exists
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const following =
      await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },

        include: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return following.map(
      (follow) => follow.following,
    );
  }

  // ==========================================
  // CHECK FOLLOW STATUS
  // ==========================================

  async checkFollowing(
    followingId: number,
    followerId: number,
  ) {
    const follow =
      await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

    return {
      following: !!follow,
    };
  }
}