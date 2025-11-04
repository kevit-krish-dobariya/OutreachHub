// campaigns/campaigns.controller.ts
import { 
  Controller, Get, Post, Body, Param, Put, Delete, 
  UseGuards, Request, 
  Query
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { ContactsService } from 'src/contacts/contacts.service';

@Controller('outreachhub/:workspaceId/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService,
  ) {}

    @Get(':id')
  @Roles('editor', 'viewer')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.campaignsService.findOne(workspaceId, id);
  }

   @Delete(':id')
  @Roles('editor')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    
    return this.campaignsService.remove(workspaceId, id, req.user);
  }

  @Post()
  @Roles('editor')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCampaignDto,
    @Request() req: any,
  ) {
    // extracted from JWT payload
    return this.campaignsService.create(workspaceId, dto, req.user);
  }

  @Get()
  @Roles('editor', 'viewer')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.campaignsService.findAll(workspaceId);
  }


  @Put(':id')
  @Roles('editor')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @Request() req: any,
  ) {
    ;
    return this.campaignsService.update(workspaceId, id, dto, req.user);
  }

}
