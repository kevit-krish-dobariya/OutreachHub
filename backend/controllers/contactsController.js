
import Contact from '../models/contactsModel.js';
import WorkspaceUser from '../models/workspaceUsersModel.js';



// -------------------- CONTACTS CRUD --------------------

// 1. Get all contacts (Viewer + Editor)
export const listContacts = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // 1️⃣ Check if user is a member of this workspace
    const membership = await WorkspaceUser.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    // 2️⃣ Fetch contacts for this workspace
    const contacts = await Contact.find({ workspaceId });
    res.status(200).json({ success: true, data: contacts });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addContacts = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, phoneNumber, tags } = req.body;

    // 1️⃣ Check if user belongs to the workspace
    const membership = await WorkspaceUser.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    // 2️⃣ Only editors can create contacts
    if (membership.role !== "editor") {
      return res.status(403).json({ message: "Only editors can create contacts" });
    }

    // 3️⃣ Check for duplicate phone number in the same workspace
    const existingContact = await Contact.findOne({ workspaceId, phoneNumber });
    if (existingContact) {
      return res.status(400).json({ message: "Contact with this phone number already exists in this workspace" });
    }

    // 4️⃣ Create new contact
    const newContact = await Contact.create({
      name,
      phoneNumber,
      tags,
      workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: newContact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Update contact (Editor only)
export const updateContacts = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    // 1️⃣ Check workspace membership
    const membership = await WorkspaceUser.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    // 2️⃣ Only editors can update
    if (membership.role !== "editor") {
      return res.status(403).json({ message: "Only editors can update contacts" });
    }

    // 3️⃣ Update contact in this workspace
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, workspaceId },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ success: true, data: updatedContact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ Delete contact (Editor only)
export const deleteContacts = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;

    // 1️⃣ Check workspace membership
    const membership = await WorkspaceUser.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    // 2️⃣ Only editors can delete
    if (membership.role !== "editor") {
      return res.status(403).json({ message: "Only editors can delete contacts" });
    }

    // 3️⃣ Delete contact in this workspace
    const deletedContact = await Contact.findOneAndDelete({ _id: id, workspaceId });

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ success: true, message: "Contact deleted successfully", data: deletedContact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


