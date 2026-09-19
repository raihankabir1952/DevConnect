import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // ==========================================
  // CONNECTED USERS
  // userId -> socketId
  // ==========================================

  private connectedUsers = new Map<
    number,
    string
  >();

  // ==========================================
  // USER CONNECTED
  // ==========================================

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = Number(data.userId);

    // ========================================
    // SAVE USER + SOCKET
    // ========================================

    this.connectedUsers.set(
      userId,
      socket.id,
    );

    console.log(
      `User ${userId} connected with socket ${socket.id}`,
    );

    // ========================================
    // SEND CONFIRMATION TO CLIENT
    // ========================================

    socket.emit('registered', {
      message:
        'User registered successfully',
      userId,
    });
  }

  // ==========================================
  // USER DISCONNECTED
  // ==========================================

  handleDisconnect(socket: Socket) {
    // ========================================
    // FIND USER BY SOCKET ID
    // ========================================

    for (const [
      userId,
      socketId,
    ] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(
          userId,
        );

        console.log(
          `User ${userId} disconnected`,
        );

        break;
      }
    }
  }

  // ==========================================
  // SEND TEST MESSAGE
  // ==========================================

  @SubscribeMessage('sendTest')
  handleTest(
    @MessageBody() data: {
      message: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(
      'Test message received:',
      data.message,
    );

    socket.emit('testResponse', {
      message:
        'WebSocket is working!',
    });
  }

  // ==========================================
  // SEND NOTIFICATION TO SPECIFIC USER
  // ==========================================

  sendNotificationToUser(
    userId: number,
    notification: any,
  ) {
    const socketId =
      this.connectedUsers.get(userId);

    // ========================================
    // USER NOT ONLINE
    // ========================================

    if (!socketId) {
      console.log(
        `User ${userId} is not connected`,
      );

      return;
    }

    // ========================================
    // SEND REAL-TIME NOTIFICATION
    // ========================================

    this.server
      .to(socketId)
      .emit(
        'newNotification',
        notification,
      );

    console.log(
      `Notification sent to user ${userId}`,
    );
  }
}