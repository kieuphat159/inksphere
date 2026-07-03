import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';
import { ChatService } from './chat.service';
import { JoinConversationDto } from './dto/join-conversation.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { SendMessageDto } from './dto/send-message.dto/send-message.dto';

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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
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
      const user = await this.chatService.findUserById(payload.sub);

      if (!user) {
        client.disconnect(true);
        return;
      }

      client.data.user = user;
      client.join(this.userRoom(user.id));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (client.data.user) {
      client.leave(this.userRoom(client.data.user.id));
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: JoinConversationDto,
  ) {
    this.requireUser(client);
    await this.chatService.ensureConversationMember(body.conversationId, client.data.user!.id);
    await client.join(this.conversationRoom(body.conversationId));

    return {
      event: 'conversation:joined',
      data: {
        conversationId: body.conversationId,
      },
    };
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: SendMessageDto,
  ) {
    const user = this.requireUser(client);
    const member = await this.chatService.ensureConversationMember(body.conversationId, user.id);

    this.chatService
      .sendMessage(user.id, body.conversationId, body, member)
      .then(async (result) => {
        this.server.to(this.conversationRoom(body.conversationId)).emit('message:new', {
          ...result.message,
          tempId: body.tempId,
        });

        const participants = await this.chatService.getConversationMembers(body.conversationId);
        this.broadcastConversationUpdated(body.conversationId, participants.map((p) => p.userId));
      })
      .catch((error) => {
        client.emit('message:error', {
          tempId: body.tempId,
          conversationId: body.conversationId,
          error: error?.message ?? 'Failed to send message',
        });
      });

    return {
      ok: true,
      tempId: body.tempId,
      conversationId: body.conversationId,
      queuedAt: new Date().toISOString(),
    };
  }

  @SubscribeMessage('conversation:read')
  async markConversationRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: MarkReadDto,
  ) {
    const user = this.requireUser(client);
    if (!body.conversationId) {
      throw new WsException('conversationId is required');
    }

    const member = await this.chatService.markConversationRead(user.id, body.conversationId, body.readAt);

    this.server.to(this.userRoom(user.id)).emit('conversation:read', {
      conversationId: body.conversationId,
      lastReadAt: member.lastReadAt,
    });

    return {
      event: 'conversation:read:ack',
      data: {
        conversationId: body.conversationId,
        lastReadAt: member.lastReadAt,
      },
    };
  }

  private broadcastConversationUpdated(conversationId: number, userIds: number[]) {
    for (const userId of userIds) {
      this.server.to(this.userRoom(userId)).emit('conversation:updated', {
        conversationId,
      });
    }
  }

  private requireUser(client: AuthedSocket) {
    if (!client.data.user) {
      throw new WsException('Unauthorized socket');
    }

    return client.data.user;
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

  private conversationRoom(conversationId: number) {
    return `conversation:${conversationId}`;
  }

  private userRoom(userId: number) {
    return `user:${userId}`;
  }
}
