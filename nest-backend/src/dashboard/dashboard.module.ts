import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from 'src/campaigns/schemas/campaigns.schema';
import { Contact, ContactSchema } from 'src/contacts/schemas/contacts.schema';
import { CampaignMessage, CampaignMessageSchema } from 'src/campaign-message/campaign-message.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
   imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: CampaignMessage.name, schema: CampaignMessageSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
   exports: [DashboardService], // export if used elsewhere
})
export class DashboardModule {}
