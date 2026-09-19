import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================

  async createNotification(data: {
    userId: number;
    actorId?: number;
    postId?: number;
    type: string;
    message: string;
  }) {
    // ========================================
    // SAVE NOTIFICATION TO DATABASE
    // ========================================

    const notification =
      await this.prisma.notification.create({
        data: {
          userId: data.userId,

          actorId: data.actorId,

          postId: data.postId,

          type: data.type,

          message: data.message,
        },

        include: {
          // ==================================
          // ACTOR
          // ==================================

          actor: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },

          // ==================================
          // POST
          // ==================================

          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

    // ========================================
    // SEND REAL-TIME NOTIFICATION
    // ========================================

    this.notificationsGateway.sendNotificationToUser(
      data.userId,
      notification,
    );

    // ========================================
    // RETURN NOTIFICATION
    // ========================================

    return notification;
  }

  // ==========================================
  // GET ALL NOTIFICATIONS
  // ==========================================

  async getNotifications(
    userId: number,
  ) {
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

  // ==========================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================

  async markAsRead(
    notificationId: number,
    userId: number,
  ) {
    const notification =
      await this.prisma.notification.findFirst({
        where: {
          id: notificationId,

          userId,
        },
      });

    // ========================================
    // CHECK NOTIFICATION
    // ========================================

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    // ========================================
    // MARK AS READ
    // ========================================

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        isRead: true,
      },
    });
  }

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  async markAllAsRead(
    userId: number,
  ) {
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