import { IsNumber, Min } from 'class-validator';

export class JoinConversationDto {
  @IsNumber()
  @Min(1)
  conversationId: number;
}
