import Workspace from "../models/workspaceModel.js";
import WorkspaceUser from "../models/workspaceUsersModel.js";
import User from "../models/userModel.js";

// ----------- Workspace Controllers -----------

export const listWorkspaces = async (req, res) => {
  try {
    // Find workspaces created by the logged-in user
    const workspaces = await Workspace.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces,
    });
  } catch (err) {
    console.error("Error fetching workspaces:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Ensure required fields exist
    if (!name) {
      return res.status(400).json({ success: false, message: "Workspace name is required" });
    }

    // Automatically set createdBy from logged-in user
    const newWorkspace = new Workspace({
      name,
      description,
      createdBy: req.user._id,  // from JWT middleware
    });

    // Save workspace
    await newWorkspace.save();
 
     const populatedWorkspace = await newWorkspace.populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data:populatedWorkspace
    });
  } catch (err) {
    console.error("Error creating workspace:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const viewWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found" });
    res.status(200).json({ success: true, data: workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found" });
    res.status(200).json({ success: true, data: workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found" });

    await WorkspaceUser.deleteMany({ workspaceId: req.params.id });
    res.status(200).json({ success: true, message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------- Workspace User Controllers -----------



// 1. List workspace users (excluding admins)

export const listWorkspaceUsers = async (req, res) => {
  try {
    const workspaceId = req.params.id;

    // 1️⃣ Get all users already in the workspace
    const workspaceUsers = await WorkspaceUser.find({ workspaceId }).select("userId");
    const existingUserIds = workspaceUsers.map(wu => wu.userId.toString());

    // 2️⃣ Get all registered users (excluding admins)
    const registeredUsers = await User.find({ role: { $ne: "admin" } })
      .select("_id username email role");

    // 3️⃣ Combine data: mark if the user is already part of this workspace
    const usersWithStatus = registeredUsers.map(user => ({
      ...user.toObject(),
      isInWorkspace: existingUserIds.includes(user._id.toString())
    }));

    res.status(200).json({
      success: true,
      count: usersWithStatus.length,
      data: usersWithStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 2. Add a new workspace user
export const addWorkspaceUser = async (req, res) => {
  try {
    const { userId, role } = req.body;
     const { id: workspaceId } = req.params; // Correct Workspace _id from URL

    // Validate role
    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Ensure user exists and is not admin
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Admin users cannot be added to workspaces" });
    }

    // Check if already added
    const exists = await WorkspaceUser.findOne({ workspaceId, userId });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already in workspace" });
    }

    // Create workspace user
    const workspaceUser = await WorkspaceUser.create({ workspaceId, userId, role });
    res.status(201).json({ success: true, data: workspaceUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. View workspace user
export const viewWorkspaceUser = async (req, res) => {
  try {
    const workspaceUser = await WorkspaceUser.findOne({
      workspaceId: req.params.id,
      userId: req.params.userId
    }).populate("userId", "username email role");

    if (!workspaceUser) {
      return res.status(404).json({ success: false, message: "Workspace user not found" });
    }

    res.status(200).json({ success: true, data: workspaceUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Update workspace user role (Admin only)
export const updateWorkspaceUser = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, userId } = req.params;

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Only Admin can change roles
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can change user roles" });
    }

    // Update only workspace-specific role
    const workspaceUser = await WorkspaceUser.findOneAndUpdate(
      { workspaceId: id, userId },
      { role },
      { new: true }
    ).populate("userId", "username email role");

    if (!workspaceUser) {
      return res.status(404).json({ success: false, message: "Workspace user not found" });
    }

    res.status(200).json({
      success: true,
      message: "Workspace user role updated successfully",
      data: workspaceUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Delete workspace user (Admin only)
export const deleteWorkspaceUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can remove users" });
    }

    const workspaceUser = await WorkspaceUser.findOneAndDelete({
      workspaceId: req.params.id,
      userId: req.params.userId
    });

    if (!workspaceUser) {
      return res.status(404).json({ success: false, message: "Workspace user not found" });
    }

    res.status(200).json({ success: true, message: "Workspace user removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
