// models/MessageTemplate.js
import mongoose from "mongoose";

const messageTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["text", "text+image"], default: "text" },
  content: { type: String },
  imageUrl: { type: String },
  tags: [{ type: String }],
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

const MessageTemplate = mongoose.model("MessageTemplate", messageTemplateSchema);
export default MessageTemplate;