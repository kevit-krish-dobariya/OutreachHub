import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageTemplateDto } from './message-template.dto'

export class UpdateMessageTemplateDto extends PartialType(CreateMessageTemplateDto) {}
