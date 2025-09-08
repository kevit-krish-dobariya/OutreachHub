// campaigns/dto/create-campaign.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  selectedTags?: string[];

  @IsOptional()
  templateId?: string;

  //@IsNotEmpty()
  workspaceId: string;

  //@IsNotEmpty()
  createdBy: string;
}
