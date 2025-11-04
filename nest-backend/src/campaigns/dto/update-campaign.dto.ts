// campaigns/dto/update-campaign.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './campaigns.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

