import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { Workspace, WorkspaceSchema } from './schemas/workspaces.schema';
import { WorkspaceUser, WorkspaceUserSchema } from '../workspace-users/schemas/workspace-user.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceUser.name, schema: WorkspaceUserSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, JwtService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
