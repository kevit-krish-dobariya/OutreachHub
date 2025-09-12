import { Module } from '@nestjs/common';
import { CampaignMessagesController } from './campaign-message.controller';
import { CampaignMessagesService } from './campaign-message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignMessage, CampaignMessageSchema } from './campaign-message.schema';
import { Campaign, CampaignSchema } from 'src/campaigns/schemas/campaigns.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    AuthModule,
    MongooseModule.forFeature([
    {name: CampaignMessage.name , schema: CampaignMessageSchema},
    {name: Campaign.name, schema: CampaignSchema}
  ])],
  controllers: [CampaignMessagesController],
  providers: [CampaignMessagesService]
})
export class CampaignMessageModule {}
