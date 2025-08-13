import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from 'src/workspaces/schemas/workspaces.schema';
import { WorkspaceUser, WorkspaceUserSchema } from '../workspace-users/schemas/workspace-user.schema'
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Contact,ContactSchema } from './schemas/contacts.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: WorkspaceUser.name, schema: WorkspaceUserSchema },
           { name: Workspace.name, schema: WorkspaceSchema }, // ✅ Added
      { name: User.name, schema: UserSchema }, 
      {name:Contact.name, schema: ContactSchema}
    ])
  ],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
