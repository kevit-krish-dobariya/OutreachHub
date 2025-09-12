import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { MessageTemplatesService } from '../message-template/message-template.service';
import { CreateMessageTemplateDto } from './dto/message-template.dto';
import { UpdateMessageTemplateDto } from './dto/update-template.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/roles.decorator';

@Controller('outreachhub/:workspaceId/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageTemplatesController {
  constructor(private readonly service: MessageTemplatesService) {}

  @Post()
  @Roles('editor')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateMessageTemplateDto,
    @Req() req
  ) {
    return this.service.create(workspaceId, dto, req.user);
  }

  @Get()
  @Roles('editor', 'viewer')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @Get(':id')
  @Roles('editor', 'viewer')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string
  ) {
    return this.service.findOne(workspaceId, id);
  }

  @Put(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessageTemplateDto,
    @Req() req
  ) {
    return this.service.update(workspaceId, id, dto, req.user);
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req
  ) {
    return this.service.remove(workspaceId, id, req.user);
  }
}
