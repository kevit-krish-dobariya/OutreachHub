import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact } from './schemas/contacts.schema';
import { CreateContactDto } from './dtos/contacts.dto';
import { UpdateContactDto } from './dtos/update-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(workspaceId: string, createContactDto: CreateContactDto, user: any) {
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can create contacts');
    const createdContact = new this.contactModel({
      ...createContactDto,
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(user._id),
    });
    return createdContact.save();
  }

  async findAll(workspaceId: string) {
    return this.contactModel.find({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
  }

  async findOne(workspaceId: string, id: string) {
    const contact = await this.contactModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(workspaceId: string, id: string, updateContactDto: UpdateContactDto, user: any) {
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can update contacts');

    const contact = await this.contactModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), workspaceId: new Types.ObjectId(workspaceId) },
      { $set: updateContactDto },
      { new: true },
    );

    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async remove(workspaceId: string, id: string, user: any) {
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can delete contacts');

    const result = await this.contactModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!result) throw new NotFoundException('Contact not found');
    return { message: 'Contact deleted successfully' };
  }
}
