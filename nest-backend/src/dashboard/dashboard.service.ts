import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignMessage } from '../campaign-message/campaign-message.schema';
import { Campaign } from '../campaigns/schemas/campaigns.schema';
import { Contact } from '../contacts/schemas/contacts.schema';
import mongoose from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(CampaignMessage.name) private campaignMessageModel: Model<CampaignMessage>,
  ) {}

  /** ✅ Overall Stats for a specific workspace */
  async getStats(workspaceId: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const totalCampaigns = await this.campaignModel.countDocuments({ workspaceId: wsId }).exec();
    const totalAudience = await this.contactModel.countDocuments({ workspaceId: wsId }).exec();
    const totalMessages = await this.campaignMessageModel.countDocuments({ workspace: wsId }).exec();
    return { totalCampaigns, totalAudience, totalMessages };
  }

  /** ✅ Campaigns created per day for a specific workspace */
  async getCampaignsPerDay(workspaceId: string, startDate: string, endDate: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const data = await this.campaignModel.aggregate([
      {
        $match: {
          workspaceId: wsId,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      labels: data.map(d => d._id),
      datasets: [{ data: data.map(d => d.count), label: 'Campaigns', backgroundColor: '#4f46e5', // Example: Indigo
      borderColor: '#4338ca' }],
    };
  }

  /** ✅ Messages per day for a specific workspace */
  async getMessagesPerDay(workspaceId: string, startDate: string, endDate: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const data = await this.campaignMessageModel.aggregate([
      {
        $match: {
          workspace: wsId,
          sentAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      labels: data.map(d => d._id),
      datasets: [{ data: data.map(d => d.count), label: 'Messages Sent',
     backgroundColor:[ '#f59e0b', '#ef4444', '#fca5a5' ], // Example: Amber
       }],
    };
  }

  /** ✅ Contacts reached per month for a specific workspace */
  async getContactsReached(workspaceId: string, startDate: string, endDate: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const data = await this.campaignMessageModel.aggregate([
      {
        $match: {
          workspace: wsId,
          sentAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      { $unwind: '$contactIds' },
      {
        $group: {
          _id: { $month: '$sentAt' },
          uniqueContacts: { $addToSet: '$contactIds' },
        },
      },
      {
        $project: {
          month: '$_id',
          count: { $size: '$uniqueContacts' },
        },
      },
      { $sort: { month: 1 } },
    ]);

    return {
      labels: data.map(d => `Month ${d.month}`),
      datasets: [{ data: data.map(d => d.count), label: 'Unique Contacts Reached' ,
        borderColor: '#22c55e', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
      }],
    };
  }
}

