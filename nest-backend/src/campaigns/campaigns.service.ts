import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Campaign } from './schemas/campaigns.schema';
import { CampaignMessagesService } from 'src/campaign-message/campaign-message.service';
import { CreateCampaignDto } from './dto/campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Contact } from 'src/contacts/schemas/contacts.schema';
import { MessageTemplate } from 'src/message-template/schemas/message-template.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    private campaignMessageService: CampaignMessagesService,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(MessageTemplate.name) private templateModel: Model<MessageTemplate>,
  ) {}

  // ---------------- Find a single campaign ----------------
  async findOne(workspaceId: string, campaignId: string) {
    // Validate IDs
    if (!isValidObjectId(workspaceId)) throw new NotFoundException('Invalid workspace ID');
    if (!isValidObjectId(campaignId)) throw new NotFoundException('Invalid campaign ID');

    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(campaignId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async remove(workspaceId: string, campaignId: string, user:any ) {
    if (!isValidObjectId(workspaceId)) throw new NotFoundException('Invalid workspace ID');
    if (!isValidObjectId(campaignId)) throw new NotFoundException('Invalid campaign ID');
  
    // Find and delete the campaign with a single query, which is more efficient
    const deleted = await this.campaignModel.findOneAndDelete({
      _id: new Types.ObjectId(campaignId),
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(user.sub), // ownership check
    });

    if (!deleted) throw new NotFoundException('Campaign not found or not owned by you');

    // Delete all associated campaign messages
    await this.campaignMessageService.deleteByCampaign(campaignId);

    return { message: 'Campaign deleted successfully' };
  }

  // ---------------- Other methods (create, update, findAll) ----------------
  async create(workspaceId: string, dto: CreateCampaignDto, user: any) {
    const created = new this.campaignModel({
      ...dto,
      // The templateId needs to be an ObjectId if it exists
      templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined,
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(user.sub),
    });

    await created.save();

    // Optional: handle campaign messages if tags and template exist
    if (dto.selectedTags?.length && dto.templateId) {
      const contacts = await this.contactModel.find({
        workspaceId: new Types.ObjectId(workspaceId),
        tags: { $in: dto.selectedTags },
      }).select('_id');

      const template = await this.templateModel.findById(dto.templateId);
      if (!template) throw new NotFoundException('Template not found');

      let messageContent = template.message?.text || '';
      if (template.message?.imageUrl) messageContent += ` [Image: ${template.message.imageUrl}]`;

      if (contacts.length > 0) {
        await this.campaignMessageService.createMessage({
          workspaceId,
          campaignId: (created._id as Types.ObjectId).toString(),
          contactIds: contacts.map(c => c._id.toString()),
          createdBy: user.sub,
          messageContent,
        });
      }
    }

    return created;
  }

  async findAll(workspaceId: string) {
  if (!isValidObjectId(workspaceId)) throw new NotFoundException('Invalid workspace ID');

  const campaigns = await this.campaignModel.find({ workspaceId: new Types.ObjectId(workspaceId) });

  const now = new Date();

      // Update statuses on the fly
      for (const campaign of campaigns) {
        if (campaign.startDate && campaign.endDate) {
          const start = new Date(campaign.startDate);
          const end = new Date(campaign.endDate);

          if (now >= start && now <= end && campaign.status !== 'Running') {
            campaign.status = 'Running';
            await campaign.save();
          } else if (now > end && campaign.status !== 'Completed') {
            campaign.status = 'Completed';
            await campaign.save();
          }
        }
      }

      return campaigns;
    }

  async update(workspaceId: string, campaignId: string, dto: UpdateCampaignDto, user: any) {
    // Ensure the user is authenticated before proceeding
    if (!user || !user.sub) {
      throw new UnauthorizedException('User not authenticated.');
    }

    if (!isValidObjectId(workspaceId)) throw new NotFoundException('Invalid workspace ID');
    if (!isValidObjectId(campaignId)) throw new NotFoundException('Invalid campaign ID');

    // Added createdBy to the find query to ensure the user can only update their own campaigns
    const updated = await this.campaignModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(campaignId),
        workspaceId: new Types.ObjectId(workspaceId),
        createdBy: new Types.ObjectId(user.sub),
      },
      {
        $set: {
          ...dto,
          templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined,
          updatedBy: new Types.ObjectId(user.sub),
        },
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Campaign not found or not owned by you');
    return updated;
  }
}
