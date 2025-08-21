import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignMessageDto } from './campaign-message.dto';

export class UpdateCampaignMessageDto extends PartialType(CreateCampaignMessageDto) {}
