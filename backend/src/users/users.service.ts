import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

import {
  uploadToCloudinary,
} from '../config/cloudinary-upload';

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
  // UPDATE PROFILE
  // NAME + BIO
  // ==========================================

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ) {
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

    // ========================================
    // TRIM VALUES
    // ========================================

    const name =
      updateProfileDto.name?.trim();

    const bio =
      updateProfileDto.bio?.trim();

    // ========================================
    // VALIDATE NAME
    // ========================================

    if (
      name !== undefined &&
      name.length === 0
    ) {
      throw new BadRequestException(
        'Name cannot be empty',
      );
    }

    // ========================================
    // UPDATE USER
    // ========================================

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...(name !== undefined && {
            name,
          }),

          ...(bio !== undefined && {
            bio: bio || null,
          }),
        },

        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profileImage: true,
          coverImage: true,
        },
      });

    return {
      message:
        'Profile updated successfully',

      user: updatedUser,
    };
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

          // Bio
          bio: true,

          // Profile Image
          profileImage: true,

          // Cover Image
          coverImage: true,

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
    // UPLOAD TO CLOUDINARY
    // ========================================

    const result =
      await uploadToCloudinary(
        file,
        'devconnect/profile-images',
      );

    // ========================================
    // CLOUDINARY IMAGE URL
    // ========================================

    const imageUrl =
      result.secure_url;

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
          bio: true,
          profileImage: true,
          coverImage: true,
        },
      });

    return {
      message:
        'Profile image updated successfully',

      user: updatedUser,
    };
  }

  // ==========================================
  // UPDATE COVER IMAGE
  // ==========================================

  async updateCoverImage(
    userId: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Cover image is required',
      );
    }

    // ========================================
    // UPLOAD TO CLOUDINARY
    // ========================================

    const result =
      await uploadToCloudinary(
        file,
        'devconnect/cover-images',
      );

    // ========================================
    // CLOUDINARY IMAGE URL
    // ========================================

    const imageUrl =
      result.secure_url;

    // ========================================
    // UPDATE USER
    // ========================================

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          coverImage: imageUrl,
        },

        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profileImage: true,
          coverImage: true,
        },
      });

    return {
      message:
        'Cover image updated successfully',

      user: updatedUser,
    };
  }
}