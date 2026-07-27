import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // CREATE COMMENT
  // ==========================================

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const {
      content,
      postId,
    } = createCommentDto;

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

    // Create comment
    return this.prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ==========================================
  // GET COMMENT BY ID
  // ==========================================

  async findOne(id: number) {
    const comment =
      await this.prisma.comment.findUnique({
        where: {
          id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    return comment;
  }

  // ==========================================
  // UPDATE COMMENT
  // ==========================================

  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ) {
    // Find comment
    const comment =
      await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

    // Check comment exists
    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    // Check comment owner
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own comment',
      );
    }

    // Update comment
    return this.prisma.comment.update({
      where: {
        id: commentId,
      },

      data: {
        content:
          updateCommentDto.content,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  async deleteComment(
    commentId: number,
    userId: number,
  ) {
    // Find comment
    const comment =
      await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

    // Check comment exists
    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    // Check comment owner
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own comment',
      );
    }

    // Delete comment
    await this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      message:
        'Comment deleted successfully',
    };
  }
}