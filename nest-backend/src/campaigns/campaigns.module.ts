import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace,WorkspaceSchema } from 'src/workspaces/schemas/workspaces.schema';
import { WorkspaceUser, WorkspaceUserSchema } from 'src/workspace-users/schemas/workspace-user.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Campaign, CampaignSchema } from './schemas/campaigns.schema';
import { Contact, ContactSchema } from 'src/contacts/schemas/contacts.schema';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports:[
    AuthModule,
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
            { name: WorkspaceUser.name, schema: WorkspaceUserSchema },
            { name: User.name, schema: UserSchema },
            { name: Campaign.name , schema: CampaignSchema}
    ])
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService]
})
export class CampaignsModule {}
