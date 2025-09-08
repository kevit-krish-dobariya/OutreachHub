import { Controller, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { WorkspaceUsersService } from './workspace-user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/role.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { WorkspaceRole } from './schemas/workspace-user.schema';



@Controller('workspace-users')
export class WorkspaceUsersController {
  constructor(private readonly workspaceUsersService: WorkspaceUsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':workspaceId')
  async addUser(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { userId: string; role: WorkspaceRole }
  ) {
    return this.workspaceUsersService.addUserToWorkspace(workspaceId, body.userId, body.role);

  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: WorkspaceRole
  ) {
    return this.workspaceUsersService.updateWorkspaceUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    return this.workspaceUsersService.removeUser(id);
  }
}
