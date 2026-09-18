import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==========================================
  // CREATE COMMENT / REPLY
  // ==========================================

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const {
      content,
      postId,
      parentId,
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

    // ==========================================
    // CHECK PARENT COMMENT
    // ==========================================

    let parentComment:
      | {
          id: number;
          content: string;
          createdAt: Date;
          userId: number;
          postId: number;
          parentId: number | null;
        }
      | null = null;

    if (parentId) {
      parentComment =
        await this.prisma.comment.findUnique({
          where: {
            id: parentId,
          },
        });

      if (!parentComment) {
        throw new NotFoundException(
          'Parent comment not found',
        );
      }

      // Make sure parent comment belongs to the same post
      if (parentComment.postId !== postId) {
        throw new NotFoundException(
          'Parent comment does not belong to this post',
        );
      }
    }

    // ==========================================
    // CREATE COMMENT / REPLY
    // ==========================================

    const comment =
      await this.prisma.comment.create({
        data: {
          content,
          postId,
          userId,
          parentId: parentId ?? null,
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

    // ==========================================
    // NOTIFICATION
    // ==========================================

    if (parentComment) {
      // Reply notification
      // Don't notify yourself
      if (parentComment.userId !== userId) {
        await this.notificationsService.createNotification({
          userId: parentComment.userId,
          actorId: userId,
          postId,
          type: 'REPLY',
          message: 'replied to your comment',
        });
      }
    } else {
      // Normal comment notification
      // Don't notify yourself
      if (post.authorId !== userId) {
        await this.notificationsService.createNotification({
          userId: post.authorId,
          actorId: userId,
          postId,
          type: 'COMMENT',
          message: 'commented on your post',
        });
      }
    }

    return comment;
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

          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },

            orderBy: {
              createdAt: 'asc',
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
