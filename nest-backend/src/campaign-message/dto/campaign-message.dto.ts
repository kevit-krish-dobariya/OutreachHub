import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateCampaignMessageDto {
  @IsNotEmpty()
  workspaceId: string;

  @IsNotEmpty()
  campaignId: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  contactIds: string[];

  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @IsNotEmpty()
  @IsString()
  messageContent: string;
}
