import MessageTemplate from "../models/messageTemplateModel.js";
import WorkspaceUser from "../models/workspaceUsersModel.js";

// 1️⃣ List templates (Viewer & Editor)
export const listTemplates = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const membership = await WorkspaceUser.findOne({ workspaceId, userId: req.user._id });
    if (!membership) return res.status(403).json({ message: "Access denied to this workspace" });

    const templates = await MessageTemplate.find({ workspaceId });
    res.status(200).json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Create template (Editor only)
export const createTemplate = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, type, content, imageUrl, tags } = req.body;

    const membership = await WorkspaceUser.findOne({ workspaceId, userId: req.user._id });
    if (!membership) return res.status(403).json({ message: "Access denied" });
    if (membership.role !== "editor") return res.status(403).json({ message: "Only editors can create templates" });

    const newTemplate = await MessageTemplate.create({
      name, type, content, imageUrl, tags,
      workspaceId,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Update template (Editor only)
export const updateTemplate = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const membership = await WorkspaceUser.findOne({ workspaceId, userId: req.user._id });
    if (!membership) return res.status(403).json({ message: "Access denied" });
    if (membership.role !== "editor") return res.status(403).json({ message: "Only editors can update templates" });

    const updated = await MessageTemplate.findOneAndUpdate({ _id: id, workspaceId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ Delete template (Editor only)
export const deleteTemplate = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    const membership = await WorkspaceUser.findOne({ workspaceId, userId: req.user._id });
    if (!membership) return res.status(403).json({ message: "Access denied" });
    if (membership.role !== "editor") return res.status(403).json({ message: "Only editors can delete templates" });

    const deleted = await MessageTemplate.findOneAndDelete({ _id: id, workspaceId });
    if (!deleted) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ success: true, message: "Template deleted", data: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
