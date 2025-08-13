import { Controller, Post, Body, Put, Param, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/role.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
getAllWorkspaces() {
  return this.workspacesService.getAllWorkspaces();
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createWorkspace(@Req() req, @Body() body) {
    return this.workspacesService.createWorkspace(
      req.user.userId,
      body.name,
      body.description,
      body.users, // [{ userId: "...", role: "editor" }]
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  updateWorkspace(@Param('id') id: string, @Body() body) {
    return this.workspacesService.updateWorkspace(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  deleteWorkspace(@Param('id') id: string) {
    return this.workspacesService.deleteWorkspace(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyWorkspace(@Req() req) {
    return this.workspacesService.getWorkspaceForUser(req.user.userId);
  }
}
