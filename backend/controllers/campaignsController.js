import Campaign from "../models/campaignsModel.js";
import Workspace from "../models/workspaceModel.js";
import Contact from "../models/contactsModel.js"; // For message logs if needed
import MessageTemplate from "../models/messageTemplateModel.js"; // Ensure you import the template model

// ---------------- Campaign CRUD ----------------

// List all campaigns for a workspace
export const listCampaigns = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const campaigns = await Campaign.find({ workspaceId })
      .populate("templateId createdBy")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new campaign
export const createCampaign = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { templateId } = req.body;

    // Fetch the template to get current content
    const template = await MessageTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Message template not found" });
    }

    const campaign = await Campaign.create({
      ...req.body,
      workspaceId,
      createdBy: req.user.id,
      messageTemplateSnapshot: template.content, // Save snapshot
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// View single campaign
export const viewCampaign = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const campaign = await Campaign.findOne({ _id: id, workspaceId })
      .populate("templateId createdBy messages.contactId");

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update campaign (only editable in Draft or Running)
export const updateCampaign = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, workspaceId, status: { $in: ["Draft", "Running"] } },
      req.body,
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found or not editable" });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const campaign = await Campaign.findOneAndDelete({ _id: id, workspaceId });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Campaign Actions ----------------

// Launch campaign
export const launchCampaign = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, workspaceId, status: "Draft" },
      { status: "Running", launchedAt: new Date() },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found or already launched" });
    }

    res.status(200).json({ success: true, message: "Campaign launched", data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Log message sent to a contact (for audit)
export const logCampaignMessage = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;
    const { contactId, messageContent } = req.body;

    // Check contact belongs to workspace (optional but safer)
    const contact = await Contact.findOne({ _id: contactId, workspaceId });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found in this workspace" });
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, workspaceId },
      {
        $push: {
          messages: { contactId, messageContent, sentAt: new Date() }
        }
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.status(200).json({ success: true, message: "Message logged", data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
