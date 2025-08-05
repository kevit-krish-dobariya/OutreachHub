// controllers/homeController.js
import Campaign from "../models/campaignsModel.js";

export const getHomeAnalytics = async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || req.user.workspaceId;

    // 1️⃣ Campaign count by status
    const campaignCounts = await Campaign.aggregate([
      { $match: { workspaceId: workspaceId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Transform to { Draft: 2, Running: 3, Completed: 5 }
    const statusCounts = { Draft: 0, Running: 0, Completed: 0 };
    campaignCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // 2️⃣ Total messages sent across all campaigns
    const messageCountAgg = await Campaign.aggregate([
      { $match: { workspaceId: workspaceId } },
      { $project: { messageCount: { $size: "$messages" } } },
      { $group: { _id: null, totalMessages: { $sum: "$messageCount" } } },
    ]);

    const totalMessagesSent = messageCountAgg[0]?.totalMessages || 0;

    // 3️⃣ Recent campaigns for table
    const recentCampaigns = await Campaign.find({ workspaceId: workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status createdAt launchedAt messages")
      .lean();

    // 4️⃣ Chart data: campaigns per month (last 6 months)
    const campaignMonthly = await Campaign.aggregate([
      { $match: { workspaceId: workspaceId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const chartData = campaignMonthly.map(item => ({
      month: `${item._id.month}-${item._id.year}`,
      campaigns: item.count,
    }));

    // Send analytics
    res.status(200).json({
      success: true,
      data: {
        campaignStatusCounts: statusCounts,
        totalMessagesSent,
        recentCampaigns,
        chartData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
