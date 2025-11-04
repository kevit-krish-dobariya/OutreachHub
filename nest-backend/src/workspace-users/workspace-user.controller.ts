import { Controller, Post, Body, Param, Delete, Put, UseGuards, Get } from '@nestjs/common';
import { WorkspaceUsersService } from './workspace-user.service'; // Corrected service import
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

  /**
   * NEW: Fetches all user associations for a specific workspace.
   * This endpoint is crucial for populating the user list in your UI.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Or any role that should be able to view members
  @Get('workspace/:workspaceId')
  async findByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.workspaceUsersService.findByWorkspace(workspaceId);
  }

 @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post(':workspaceId/assign/:userId')
async assignUser(
  @Param('workspaceId') workspaceId: string,
  @Param('userId') userId: string,
  @Body('role') role: WorkspaceRole,
) {
  const assignedRole = role ?? WorkspaceRole.VIEWER;
  return this.workspaceUsersService.assignUserToWorkspace(workspaceId, userId, assignedRole);
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

