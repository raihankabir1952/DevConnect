import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create notification
  async createNotification(data: {
    userId: number;
    actorId?: number;
    postId?: number;
    type: string;
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        actorId: data.actorId,
        postId: data.postId,
        type: data.type,
        message: data.message,
      },
    });
  }

  // Get current user's notifications
  async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Mark one notification as read
  async markAsRead(
    notificationId: number,
    userId: number,
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
