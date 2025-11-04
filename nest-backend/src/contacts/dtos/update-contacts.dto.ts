import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './contacts.dto';
import { IsMongoId, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsOptional()
  @IsMongoId()
  workspaceId?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
