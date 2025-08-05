// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Running", "Completed"],
      default: "Draft",
    },
    selectedTags: [{ type: String }],

    // Template reference and snapshot
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageTemplate",
    },
    messageTemplateSnapshot: {
      type: String,
      required: true, // snapshot of template at creation/launch
    },

    launchedAt: { type: Date },

    // Multi-tenant support
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Messages sent per contact (history/audit)
    messages: [
      {
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
        messageContent: { type: String },
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for performance
campaignSchema.index({ workspaceId: 1, status: 1 });

export default mongoose.model("Campaign", campaignSchema);
