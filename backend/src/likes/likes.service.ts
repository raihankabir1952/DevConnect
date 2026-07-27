import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async toggleLike(
    postId: number,
    userId: number,
  ) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    // Check if user already liked the post
    const existingLike =
      await this.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

    // If already liked, remove like
    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return {
        message: 'Post unliked successfully',
        liked: false,
      };
    }

    // Otherwise create like
    await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return {
      message: 'Post liked successfully',
      liked: true,
    };
  }
}