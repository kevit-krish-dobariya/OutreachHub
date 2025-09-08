// campaigns/campaigns.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './schemas/campaigns.schema';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(@InjectModel(Campaign.name) private campaignModel: Model<Campaign>) {}

  async create(workspaceId: string, dto: CreateCampaignDto, userId: string) {
    const created = new this.campaignModel({
      ...dto,
      templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined, // ✅ convert templateId
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
    });
    return created.save();
  }

  async findAll(workspaceId: string) {
    return this.campaignModel.find({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
  }

  async findOne(workspaceId: string, id: string) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(workspaceId: string, id: string, dto: UpdateCampaignDto, userId: string) {
    const updated = await this.campaignModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), workspaceId: new Types.ObjectId(workspaceId) },
      {
        $set: {
          ...dto,
          templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined, // ✅ ensure ObjectId on update too
          updatedBy: new Types.ObjectId(userId),
        },
      },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Campaign not found');
    return updated;
  }

  async remove(workspaceId: string, id: string, userId: string) {
    const deleted = await this.campaignModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId), // optionally enforce ownership
    });
    if (!deleted) throw new NotFoundException('Campaign not found or not owned by you');
    return { message: 'Campaign deleted successfully' };
  }
}
