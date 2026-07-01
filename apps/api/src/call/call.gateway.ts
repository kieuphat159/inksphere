import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from '../auth/types/auth.jwtPayload';
import { CallService } from './call.service';

type AuthedSocket = Socket & {
  data: {
    user?: {
      id: number;
    };
  };
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly callService: CallService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token);
      client.data.user = { id: payload.sub };
      client.join(this.userRoom(payload.sub));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (client.data.user) {
      client.leave(this.userRoom(client.data.user.id));
    }
  }

  @SubscribeMessage('call:invite')
  async handleInvite(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: number; targetUserId: number },
  ) {
    const user = this.requireUser(client);
    const canInitiate = await this.callService.canInitiateCall(
      body.conversationId,
      user.id,
      body.targetUserId,
    );

    if (!canInitiate) {
      return { event: 'call:invite:failed', data: { message: 'Unable to start call' } };
    }

    this.server.to(this.userRoom(body.targetUserId)).emit('call:incoming', {
      conversationId: body.conversationId,
      fromUserId: user.id,
      fromUserName: user.id,
    });

    return { event: 'call:invite:sent', data: { targetUserId: body.targetUserId } };
  }

  @SubscribeMessage('call:accept')
  async handleAccept(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: number; fromUserId: number },
  ) {
    const user = this.requireUser(client);
    this.server.to(this.userRoom(body.fromUserId)).emit('call:accepted', {
      conversationId: body.conversationId,
      toUserId: user.id,
    });

    return { event: 'call:accepted:ack', data: { conversationId: body.conversationId } };
  }

  @SubscribeMessage('call:offer')
  async handleOffer(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { targetUserId: number; offer: unknown },
  ) {
    this.requireUser(client);
    this.server.to(this.userRoom(body.targetUserId)).emit('call:offer', {
      fromUserId: client.data.user!.id,
      offer: body.offer,
    });
  }

  @SubscribeMessage('call:answer')
  async handleAnswer(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { targetUserId: number; answer: unknown },
  ) {
    this.requireUser(client);
    this.server.to(this.userRoom(body.targetUserId)).emit('call:answer', {
      fromUserId: client.data.user!.id,
      answer: body.answer,
    });
  }

  @SubscribeMessage('call:reject')
  async handleReject(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: number; fromUserId: number },
  ) {
    const user = this.requireUser(client);
    this.server.to(this.userRoom(body.fromUserId)).emit('call:rejected', {
      conversationId: body.conversationId,
      fromUserId: user.id,
    });

    return { event: 'call:rejected:ack', data: { conversationId: body.conversationId } };
  }

  @SubscribeMessage('call:ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { targetUserId: number; candidate: unknown },
  ) {
    const user = this.requireUser(client);
    this.server.to(this.userRoom(body.targetUserId)).emit('call:ice-candidate', {
      fromUserId: user.id,
      candidate: body.candidate,
    });
  }

  @SubscribeMessage('call:hangup')
  async handleHangup(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: number; targetUserId: number },
  ) {
    const user = this.requireUser(client);
    this.server.to(this.userRoom(body.targetUserId)).emit('call:ended', {
      conversationId: body.conversationId,
      fromUserId: user.id,
    });
  }

  private extractToken(client: AuthedSocket) {
    const authToken = client.handshake.auth?.token;
    const headerToken = client.handshake.headers.authorization;
    const token = authToken ?? headerToken;

    if (!token) {
      return null;
    }

    if (token.startsWith('Bearer ')) {
      return token.slice(7).trim();
    }

    return token.trim();
  }

  private requireUser(client: AuthedSocket) {
    if (!client.data.user) {
      throw new Error('Unauthorized socket');
    }

    return client.data.user;
  }

  private userRoom(userId: number) {
    return `user:${userId}`;
  }
}
