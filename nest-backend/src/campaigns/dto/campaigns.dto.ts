import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { CampaignStatus } from '../schemas/campaigns.schema';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  contacts?: string[];

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
