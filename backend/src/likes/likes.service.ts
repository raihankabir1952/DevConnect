import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==========================================
  // LIKE / UNLIKE POST
  // ==========================================

  async toggleLike(
    postId: number,
    userId: number,
  ) {
    // Check if post exists
    const post =
      await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    // Check existing like
    const existingLike =
      await this.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

    // ==========================================
    // UNLIKE
    // ==========================================

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Get updated like count
      const likeCount =
        await this.prisma.like.count({
          where: {
            postId,
          },
        });

      return {
        message:
          'Post unliked successfully',

        liked: false,

        likeCount,
      };
    }

    // ==========================================
    // LIKE
    // ==========================================

    await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    // Don't notify the user if they like
    // their own post
    if (post.authorId !== userId) {
      await this.notificationsService.createNotification({
        userId: post.authorId,
        actorId: userId,
        postId,
        type: 'LIKE',
        message: 'liked your post',
      });
    }

    // Get updated like count
    const likeCount =
      await this.prisma.like.count({
        where: {
          postId,
        },
      });

    return {
      message:
        'Post liked successfully',

      liked: true,

      likeCount,
    };
  }

  // ==========================================
  // CHECK LIKE STATUS
  // ==========================================

  async getLikeStatus(
    postId: number,
    userId: number,
  ) {
    // Check if post exists
    const post =
      await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    // Find user's like
    const existingLike =
      await this.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

    return {
      liked: !!existingLike,
    };
  }
}
