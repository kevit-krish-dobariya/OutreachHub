import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];

//   @IsMongoId()
//   @IsNotEmpty()
  workspaceId: string;

//   @IsMongoId()
//   @IsNotEmpty()
  createdBy: string;
}
