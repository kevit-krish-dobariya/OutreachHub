import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceUser, WorkspaceUserSchema } from './schemas/workspace-user.schema';
import { WorkspaceUsersService } from './workspace-user.service';
import { WorkspaceUsersController } from './workspace-user.controller';
import { Workspace, WorkspaceSchema } from 'src/workspaces/schemas/workspaces.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
     AuthModule,
    MongooseModule.forFeature([{ name: WorkspaceUser.name, schema: WorkspaceUserSchema },
           { name: Workspace.name, schema: WorkspaceSchema }, // ✅ Added
      { name: User.name, schema: UserSchema }, 
    ])
  ],
  controllers: [WorkspaceUsersController],
  providers: [WorkspaceUsersService],
  exports: [WorkspaceUsersService],
})
export class WorkspaceUsersModule {}