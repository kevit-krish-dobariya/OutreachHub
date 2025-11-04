import { IsNotEmpty, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedTags?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsOptional()
  templateId?: string;

  //@IsNotEmpty()
  workspaceId: string;

  //@IsNotEmpty()
  createdBy: string;
}