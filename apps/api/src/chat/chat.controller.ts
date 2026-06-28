import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async listConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  async listMessages(
    @Req() req: any,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getMessages(req.user.id, conversationId, {
      limit: limit ? Number(limit) : undefined,
      cursorId: cursor ? Number(cursor) : undefined,
    });
  }

  @Post('conversations/direct')
  async createDirect(@Req() req: any, @Body() body: CreateDirectConversationDto) {
    return this.chatService.createDirectConversation(req.user.id, body.participantId);
  }

  @Post('conversations/group')
  async createGroup(@Req() req: any, @Body() body: CreateGroupConversationDto) {
    return this.chatService.createGroupConversation(req.user.id, body);
  }

  @Post('conversations/:id/read')
  async markRead(
    @Req() req: any,
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() body: MarkReadDto,
  ) {
    return this.chatService.markConversationRead(req.user.id, conversationId, body.readAt);
  }
}
