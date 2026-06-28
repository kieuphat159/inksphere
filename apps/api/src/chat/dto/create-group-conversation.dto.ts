import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, Min, ArrayUnique } from 'class-validator';

export class CreateGroupConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  memberIds: number[];
}
