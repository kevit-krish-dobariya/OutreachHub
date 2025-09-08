// campaign-messages/campaign-messages.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Req,UseGuards } from '@nestjs/common';
import { CampaignMessagesService } from './campaign-message.service';
import { CreateCampaignMessageDto } from './dto/campaign-message.dto';
import { UpdateCampaignMessageDto } from './dto/updatecampaign-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/roles.decorator';

@Controller('outreachhub/:workspaceId/campaigns/:campaignId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignMessagesController {
  constructor(
    private readonly campaignMessagesService: CampaignMessagesService,
  ) {}

  @Post()
  @Roles('editor')
  create(
    @Param('workspaceId') workspaceId: string,
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateCampaignMessageDto,
    @Req() req,
  ) {
    return this.campaignMessagesService.create(
      workspaceId,
      campaignId,
      dto,
      req.user._id, // logged-in user id
    );
  }

  @Get()
  @Roles('editor', 'viewer')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignMessagesService.findAll(workspaceId, campaignId);
  }

  @Get(':id')
  @Roles('editor', 'viewer')
  findOne(@Param('id') id: string) {
    return this.campaignMessagesService.findOne(id);
  }

  @Put(':id')
  @Roles('editor')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignMessageDto) {
    return this.campaignMessagesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('editor')
  remove(@Param('id') id: string) {
    return this.campaignMessagesService.remove(id);
  }
}
