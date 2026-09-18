import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==========================================
  // GET CURRENT USER'S NOTIFICATIONS
  // GET /notifications
  // ==========================================

  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationsService.getNotifications(
      req.user.userId,
    );
  }

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // PATCH /notifications/:id/read
  // ==========================================

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) notificationId: number,
    @Request() req: any,
  ) {
    return this.notificationsService.markAsRead(
      notificationId,
      req.user.userId,
    );
  }

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // PATCH /notifications/read-all
  // ==========================================

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    );
  }
}
