import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class MarkReadDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  conversationId?: number;

  @IsOptional()
  @IsDateString()
  readAt?: string;
}
