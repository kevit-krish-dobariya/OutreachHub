// models/Contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  tags: [{ type: String }],
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
},{
  timestamps: true,
});

// Index: workspaceId + phoneNumber
contactSchema.index({ workspaceId: 1, phoneNumber: 1 });

// Index: workspaceId + tags
contactSchema.index({ workspaceId: 1, tags: 1 });

const contacts = mongoose.model('Contact', contactSchema);
export default contacts;