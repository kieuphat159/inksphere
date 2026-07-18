import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

type AuthedSocket = Socket & { data: { userId?: number } };

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub ?? payload.id;
      // Join personal room for targeted notifications
      client.join(`user:${client.data.userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthedSocket) {
    // Cleanup handled automatically by Socket.IO
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthedSocket) {
    client.emit('pong');
  }

  /**
   * Send a notification to a specific user's room.
   * Called by NotificationService after creating a DB record.
   */
  sendToUser(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
