import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dtos/contacts.dto';
import { UpdateContactDto } from './dtos/update-contacts.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/role.guard';
import { JwtAuthGuard} from '../auth/jwt-auth.guard';

@Controller('outreachhub/:workspaceId/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles('editor')
  create(@Param('workspaceId') workspaceId: string, @Body() createContactDto: CreateContactDto, @Req() req) {
    return this.contactsService.create(workspaceId, createContactDto, req.user);
  }

  @Get()
  @Roles('editor', 'viewer')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.contactsService.findAll(workspaceId);
  }

  @Get(':id')
  @Roles('editor', 'viewer')
  findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.contactsService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles('editor')
  update(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Body() updateContactDto: UpdateContactDto, @Req() req) {
    return this.contactsService.update(workspaceId, id, updateContactDto, req.user);
  }

  @Delete(':id')
  @Roles('editor')
  remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Req() req) {
    return this.contactsService.remove(workspaceId, id, req.user);
  }
}
