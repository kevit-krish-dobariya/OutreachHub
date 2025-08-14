import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageTemplate } from './schemas/message-template.schema';
import { CreateMessageTemplateDto } from './dto/message-template.dto';
import { UpdateMessageTemplateDto } from './dto/update-template.dto';

@Injectable()
export class MessageTemplatesService {
  constructor(
    @InjectModel(MessageTemplate.name)
    private messageTemplateModel: Model<MessageTemplate>,
  ) {}

  async create(workspaceId: string, createDto: CreateMessageTemplateDto, user: any) {
    if (user.role !== 'editor') {
      throw new ForbiddenException('Only editors can create message templates');
    }

    const newTemplate = new this.messageTemplateModel({
      name: createDto.name,
      type: createDto.type,
      message: {
        text: createDto.messageText,
        imageUrl: createDto.imageUrl || null,
      },
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(user._id),
    });

    return newTemplate.save();
  }

  async findAll(workspaceId: string) {
    return this.messageTemplateModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate('createdBy', 'name email')
      .exec();
  }

  async findOne(workspaceId: string, id: string) {
    const template = await this.messageTemplateModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    return template;
  }

  async update(workspaceId: string, id: string, updateDto: UpdateMessageTemplateDto, user: any) {
    if (user.role !== 'editor') {
      throw new ForbiddenException('Only editors can update message templates');
    }

    const updatedTemplate = await this.messageTemplateModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), workspaceId: new Types.ObjectId(workspaceId) },
      {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.type && { type: updateDto.type }),
        ...(updateDto.messageText && { 'message.text': updateDto.messageText }),
        ...(updateDto.imageUrl && { 'message.imageUrl': updateDto.imageUrl }),
      },
      { new: true },
    );

    if (!updatedTemplate) {
      throw new NotFoundException('Message template not found');
    }

    return updatedTemplate;
  }

  async remove(workspaceId: string, id: string, user: any) {
    if (user.role !== 'editor') {
      throw new ForbiddenException('Only editors can delete message templates');
    }

    const deletedTemplate = await this.messageTemplateModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!deletedTemplate) {
      throw new NotFoundException('Message template not found');
    }

    return { message: 'Message template deleted successfully' };
  }
}
