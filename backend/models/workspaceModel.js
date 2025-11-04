import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Workspace = mongoose.model("Workspace", WorkspaceSchema);
export default Workspace;