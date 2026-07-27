import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // CREATE A NEW POST
  // ==========================================

  async create(
    createPostDto: CreatePostDto,
    userId: number,
  ) {
    const post =
      await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          authorId: userId,
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,

              // Profile Image
              profileImage: true,
            },
          },
        },
      });

    return {
      message:
        'Post created successfully',

      post,
    };
  }

  // ==========================================
  // GET ALL POSTS
  // WITH SEARCH AND PAGINATION
  // ==========================================

  async findAll(
    search?: string,
    page = 1,
    limit = 10,
  ) {
    // ========================================
    // PREVENT INVALID PAGE
    // ========================================

    if (page < 1) {
      page = 1;
    }

    // ========================================
    // PREVENT INVALID LIMIT
    // ========================================

    if (limit < 1) {
      limit = 10;
    }

    // ========================================
    // PREVENT VERY LARGE REQUESTS
    // ========================================

    if (limit > 100) {
      limit = 100;
    }

    // ========================================
    // CALCULATE SKIP
    // ========================================

    const skip =
      (page - 1) * limit;

    // ========================================
    // SEARCH CONDITION
    // ========================================

    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,

                mode:
                  'insensitive' as const,
              },
            },

            {
              content: {
                contains: search,

                mode:
                  'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    // ========================================
    // GET POSTS + TOTAL COUNT
    // ========================================

    const [
      posts,
      totalPosts,
    ] = await Promise.all([
      this.prisma.post.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          // ==================================
          // POST AUTHOR
          // ==================================

          author: {
            select: {
              id: true,
              name: true,

              // IMPORTANT
              // Return profile image
              profileImage: true,
            },
          },

          // ==================================
          // POST COUNTS
          // ==================================

          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),

      // ======================================
      // TOTAL POSTS
      // ======================================

      this.prisma.post.count({
        where,
      }),
    ]);

    // ========================================
    // TOTAL PAGES
    // ========================================

    const totalPages =
      Math.ceil(
        totalPosts / limit,
      );

    // ========================================
    // RETURN RESPONSE
    // ========================================

    return {
      data: posts,

      pagination: {
        currentPage: page,

        limit,

        totalPosts,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  // ==========================================
  // GET SINGLE POST
  // ==========================================

  async findOne(
    id: number,
  ) {
    const post =
      await this.prisma.post.findUnique({
        where: {
          id,
        },

        include: {
          // ==================================
          // POST AUTHOR
          // ==================================

          author: {
            select: {
              id: true,
              name: true,
              email: true,

              // Profile Image
              profileImage: true,
            },
          },

          // ==================================
          // COMMENTS
          // ==================================

          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,

                  // Profile Image
                  profileImage: true,
                },
              },
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          // ==================================
          // POST COUNTS
          // ==================================

          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

    // ========================================
    // CHECK POST
    // ========================================

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    return post;
  }

  // ==========================================
  // UPDATE OWN POST
  // ==========================================

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ) {
    // ========================================
    // FIND POST
    // ========================================

    const post =
      await this.prisma.post.findUnique({
        where: {
          id,
        },
      });

    // ========================================
    // CHECK POST
    // ========================================

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    // ========================================
    // CHECK OWNERSHIP
    // ========================================

    if (
      post.authorId !== userId
    ) {
      throw new ForbiddenException(
        'You can only update your own post',
      );
    }

    // ========================================
    // UPDATE POST
    // ========================================

    const updatedPost =
      await this.prisma.post.update({
        where: {
          id,
        },

        data: {
          title:
            updatePostDto.title,

          content:
            updatePostDto.content,
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,

              // Profile Image
              profileImage: true,
            },
          },
        },
      });

    return {
      message:
        'Post updated successfully',

      post: updatedPost,
    };
  }

  // ==========================================
  // DELETE OWN POST
  // ==========================================

  async remove(
    id: number,
    userId: number,
  ) {
    // ========================================
    // FIND POST
    // ========================================

    const post =
      await this.prisma.post.findUnique({
        where: {
          id,
        },
      });

    // ========================================
    // CHECK POST
    // ========================================

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    // ========================================
    // CHECK OWNERSHIP
    // ========================================

    if (
      post.authorId !== userId
    ) {
      throw new ForbiddenException(
        'You can only delete your own post',
      );
    }

    // ========================================
    // DELETE POST
    // ========================================

    await this.prisma.post.delete({
      where: {
        id,
      },
    });

    return {
      message:
        'Post deleted successfully',
    };
  }
}