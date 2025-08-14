import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument, CampaignStatus } from './schemas/campaigns.schema';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(@InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>) {}

  async createCampaign(workspaceId: string, createCampaignDto: CreateCampaignDto, user: any) {
    
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can create campaigns');


    const campaign = new this.campaignModel({
      ...createCampaignDto,
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(user._id),
      status: createCampaignDto.status || CampaignStatus.DRAFT,
    });

    return campaign.save();
  }

  async getAllCampaigns(workspaceId: string) {
    return this.campaignModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate('contacts')
      .exec();
  }

  async getCampaignById(workspaceId: string, id: string) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    }).populate('contacts');

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async updateCampaign(workspaceId: string, id: string, updateCampaignDto: UpdateCampaignDto, user: any) {
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can update campaigns');

    const campaign = await this.campaignModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), workspaceId: new Types.ObjectId(workspaceId) },
      { $set: updateCampaignDto },
      { new: true },
    );

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async deleteCampaign(workspaceId: string, id: string, user: any) {
    if (user.role !== 'editor') throw new ForbiddenException('Only editors can delete campaigns');

    const result = await this.campaignModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!result) throw new NotFoundException('Campaign not found');
    return { message: 'Campaign deleted successfully' };
  }
}
