import { IsNumber, Min } from 'class-validator';

export class CreateDirectConversationDto {
  @IsNumber()
  @Min(1)
  participantId: number;
}
