import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WorkspaceUsersModule } from './workspace-users/workspace-users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MessageTemplateModule } from './message-template/message-template.module';
import { CampaignMessageModule } from './campaign-message/campaign-message.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
     ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb+srv://krishdobariya:cg6FcbCGLWauHIIW@cluster0.uxlm8xp.mongodb.net/OutreachHub'),
    AuthModule,
    WorkspacesModule,
    WorkspaceUsersModule,
    ContactsModule,
    CampaignsModule,
    MessageTemplateModule,
    CampaignMessageModule],
})
export class AppModule {}
