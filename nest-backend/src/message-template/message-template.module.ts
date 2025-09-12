import { Module } from '@nestjs/common';
import { MessageTemplatesService } from './message-template.service';
import { MessageTemplatesController } from './message-template.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageTemplate, MessageTemplateSchema } from './schemas/message-template.schema';
import { Workspace, WorkspaceSchema } from 'src/workspaces/schemas/workspaces.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Contact, ContactSchema } from 'src/contacts/schemas/contacts.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    AuthModule,
    MongooseModule.forFeature([
    { name: MessageTemplate.name, schema: MessageTemplateSchema },
    { name: Workspace.name, schema: WorkspaceSchema }, // ✅ Added
          { name: User.name, schema: UserSchema }, 
          {name:Contact.name, schema: ContactSchema}
  ])],
  controllers: [MessageTemplatesController],
  providers: [MessageTemplatesService]
})
export class MessageTemplateModule {}
