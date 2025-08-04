import mongoose from "mongoose";

const WorkspaceUserSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ['editor','viewer'], default: 'viewer' }
}, { timestamps: true });

const workspaceusers = mongoose.model("WorkspaceUser", WorkspaceUserSchema);
export default workspaceusers;

