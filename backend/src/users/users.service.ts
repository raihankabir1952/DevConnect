import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // SEARCH USERS BY NAME
  // ==========================================

  async searchUsers(name: string) {
  return this.prisma.user.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },

    select: {
      id: true,
      name: true,
      profileImage: true,
    },

    orderBy: {
      name: 'asc',
    },
  });
}

  // ==========================================
  // GET USER PROFILE BY ID
  // ==========================================

  async findOne(id: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,

          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
              followers: true,
              following: true,
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  // ==========================================
  // UPDATE PROFILE IMAGE
  // ==========================================

  async updateProfileImage(
    userId: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Profile image is required',
      );
    }

    // ========================================
    // CREATE IMAGE URL
    // ========================================

    const imageUrl =
      `/uploads/profile-images/${file.filename}`;

    // ========================================
    // UPDATE USER
    // ========================================

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          profileImage: imageUrl,
        },

        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });

    return {
      message:
        'Profile image updated successfully',

      user: updatedUser,
    };
  }
}