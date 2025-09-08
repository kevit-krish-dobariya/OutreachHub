// campaign-messages/dto/create-campaign-message.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCampaignMessageDto {
// //   @IsNotEmpty()
//   campaignId: string;

  @IsNotEmpty()
  contactIds: string[];

  @IsString()
  @IsNotEmpty()
  messageContent: string;
}
