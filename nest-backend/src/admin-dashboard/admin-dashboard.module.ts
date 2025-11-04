import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from 'src/workspaces/schemas/workspaces.schema';
import { WorkspaceUser, WorkspaceUserSchema } from 'src/workspace-users/schemas/workspace-user.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Campaign, CampaignSchema } from 'src/campaigns/schemas/campaigns.schema';
import { Contact, ContactSchema } from 'src/contacts/schemas/contacts.schema';
import { CampaignMessage, CampaignMessageSchema } from 'src/campaign-message/campaign-message.schema';
import { MessageTemplate, MessageTemplateSchema } from 'src/message-template/schemas/message-template.schema';
import { Activity, ActivitySchema } from './activity.schema';

@Module({
   imports:[
      AuthModule,
      MongooseModule.forFeature([
        { name: Workspace.name, schema: WorkspaceSchema },
              { name: WorkspaceUser.name, schema: WorkspaceUserSchema },
              { name: User.name, schema: UserSchema },
              { name: Campaign.name , schema: CampaignSchema},
              { name:Contact.name, schema:ContactSchema},
              {name: CampaignMessage.name, schema: CampaignMessageSchema},
              {name: MessageTemplate.name, schema: MessageTemplateSchema},
              {name: Activity.name, schema: ActivitySchema}
      ])
    ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService]
})
export class AdminDashboardModule {}
