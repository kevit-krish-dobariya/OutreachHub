import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/role.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('outreachhub/:workspaceId/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles('editor')
  createCampaign(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCampaignDto,
    @Req() req,
  ) {
    return this.campaignsService.createCampaign(workspaceId, dto, req.user);
  }

  @Get()
  @Roles('editor', 'viewer')
  getAllCampaigns(@Param('workspaceId') workspaceId: string) {
    return this.campaignsService.getAllCampaigns(workspaceId);
  }

  @Get(':id')
  @Roles('editor', 'viewer')
  getCampaignById(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.campaignsService.getCampaignById(workspaceId, id);
  }

   @Put(':id')
  @Roles('editor')
  updateCampaign(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @Req() req
  ) {
    return this.campaignsService.updateCampaign(workspaceId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles('editor')
  deleteCampaign(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Req() req) {
    return this.campaignsService.deleteCampaign(workspaceId, id, req.user.userId);
  }
}
