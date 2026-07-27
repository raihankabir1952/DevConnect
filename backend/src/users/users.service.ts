import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    // ==========================================
    // CLOUDINARY CONFIGURATION
    // ==========================================

    cloudinary.config({
      cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

      api_key:
        process.env.CLOUDINARY_API_KEY,

      api_secret:
        process.env.CLOUDINARY_API_SECRET,
    });
  }

  // ==========================================
  // SEARCH USERS BY NAME
  // GET /users/search?name=Raihan
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
  // GET /users/:id
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

              // Followers
              followers: true,

              // Following
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
  // UPLOAD PROFILE IMAGE
  // ==========================================

  async uploadProfileImage(
    userId: number,
    file: Express.Multer.File,
  ) {
    // ==========================================
    // CHECK USER EXISTS
    // ==========================================

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

    // ==========================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ==========================================

    const uploadResult =
      await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: 'devconnect/profile-images',

              transformation: [
                {
                  width: 500,
                  height: 500,
                  crop: 'fill',
                  gravity: 'face',
                },
              ],
            },

            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    'Image upload failed',
                  ),
                );

                return;
              }

              resolve({
                secure_url:
                  result.secure_url,
              });
            },
          );

        uploadStream.end(file.buffer);
      });

    // ==========================================
    // SAVE IMAGE URL TO DATABASE
    // ==========================================

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          profileImage:
            uploadResult.secure_url,
        },

        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });

    // ==========================================
    // RETURN UPDATED USER
    // ==========================================

    return {
      message:
        'Profile image uploaded successfully',

      user: updatedUser,
    };
  }
}