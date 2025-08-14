import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateMessageTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['Text', 'Text-Image'])
  type: string;

  @IsString()
  @IsNotEmpty()
  messageText: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  //@IsMongoId()
  workspaceId?: string;

  //@IsMongoId()
  createdBy?: string;
}
