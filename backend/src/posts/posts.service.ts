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

  // Create a new post
  async create(
    createPostDto: CreatePostDto,
    userId: number,
  ) {
    const post = await this.prisma.post.create({
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
          },
        },
      },
    });

    return {
      message: 'Post created successfully',
      post,
    };
  }

  // Get all posts with search and pagination
  async findAll(
    search?: string,
    page = 1,
    limit = 10,
  ) {
    // Prevent invalid values
    if (page < 1) {
      page = 1;
    }

    if (limit < 1) {
      limit = 10;
    }

    // Prevent very large requests
    if (limit > 100) {
      limit = 100;
    }

    const skip = (page - 1) * limit;

    // Search condition
    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              content: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    // Get posts and total count together
    const [posts, totalPosts] =
      await Promise.all([
        this.prisma.post.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),

        this.prisma.post.count({
          where,
        }),
      ]);

    const totalPages = Math.ceil(
      totalPosts / limit,
    );

    return {
      data: posts,
      pagination: {
        currentPage: page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Get single post
  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    return post;
  }

  // Update own post
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only update your own post',
      );
    }

    const updatedPost =
      await this.prisma.post.update({
        where: {
          id,
        },
        data: {
          title: updatePostDto.title,
          content: updatePostDto.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return {
      message: 'Post updated successfully',
      post: updatedPost,
    };
  }

  // Delete own post
  async remove(
    id: number,
    userId: number,
  ) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(
        'Post not found',
      );
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own post',
      );
    }

    await this.prisma.post.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Post deleted successfully',
    };
  }
}