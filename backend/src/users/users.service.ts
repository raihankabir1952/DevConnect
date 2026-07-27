import {
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

          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
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
}