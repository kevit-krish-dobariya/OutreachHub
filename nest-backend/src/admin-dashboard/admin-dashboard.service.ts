import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from 'src/campaigns/schemas/campaigns.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Workspace } from 'src/workspaces/schemas/workspaces.schema';
import { CampaignMessage } from 'src/campaign-message/campaign-message.schema';
import { Activity } from './activity.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CampaignMessage.name) private campaignMessageModel: Model<CampaignMessage>,
     @InjectModel(Activity.name) private activityModel: Model<Activity>
  ) {}

  /**
   * Gathers statistics from multiple collections for the admin dashboard summary cards.
   */
  async getAdminStats() {
    const [totalWorkspaces, totalUsers, totalCampaigns, totalMessages] = await Promise.all([
      this.workspaceModel.countDocuments().exec(),
      this.userModel.countDocuments().exec(),
      this.campaignModel.countDocuments().exec(),
      this.campaignMessageModel.countDocuments().exec(),
    ]);
    return { totalWorkspaces, totalUsers, totalCampaigns, totalMessages };
  }

  /**
   * Aggregates user signups over the last 30 days for the "User Growth" chart.
   */
  async getUserGrowthPerDay() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await this.userModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
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
      datasets: [{ data: data.map(d => d.count), label: 'New Users' }],
    };
  }

  /**
   * Aggregates campaign creations over the last 30 days for the "Campaign Performance" chart.
   */
  async getCampaignsPerDay() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await this.campaignModel.aggregate([
       { $match: { createdAt: { $gte: thirtyDaysAgo } } },
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
      datasets: [{ data: data.map(d => d.count), label: 'New Campaigns' }],
    };
  }

  async getRecentActivities() {
    return this.activityModel
      .find()
      .sort({ createdAt: -1 }) // Get the newest first
      .limit(5) // Limit to the last 5 activities
      .populate({
        path: 'user',
        select: 'username', // Only get the username of the user who performed the action
      })
      .exec();
  }
}
