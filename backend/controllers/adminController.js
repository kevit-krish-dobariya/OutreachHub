import Workspace from "../models/workspaceModel.js";
import WorkspaceUser from "../models/workspaceUsersModel.js";
import User from "../models/userModel.js";

// ----------- Workspace Controllers -----------

export const listWorkspaces = async (req, res) => {
  try {
    const allWorkspaces = await Workspace.find();
    res.status(200).json({ success: true, data: allWorkspaces });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createWorkspace = async (req, res) => {
  try {
    const newWorkspace = await Workspace.create({ 
      ...req.body, 
      createdBy: req.user.userId 
    });
    res.status(201).json({ success: true, data: newWorkspace });
  } catch (err) {
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

export const listWorkspaceUsers = async (req, res) => {
  try {
    const users = await WorkspaceUser.find({ workspaceId: req.params.id }).populate("userId");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addWorkspaceUser = async (req, res) => {
  try {
    const workspaceUser = await WorkspaceUser.create({
      workspaceId: req.params.id,
      userId: req.body.userId,
      role: req.body.role
    });
    res.status(201).json({ success: true, data: workspaceUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const viewWorkspaceUser = async (req, res) => {
  try {
    const workspaceUser = await WorkspaceUser.findOne({
      workspaceId: req.params.id,
      userId: req.params.userId
    }).populate("userId");

    if (!workspaceUser) return res.status(404).json({ success: false, message: "Workspace user not found" });
    res.status(200).json({ success: true, data: workspaceUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const updateWorkspaceUser = async (req, res) => {
//   try {
//     const workspaceUser = await WorkspaceUser.findOneAndUpdate(
//       { workspaceId: req.params.id, userId: req.params.userId },
//       { role: req.body.role },
//       { new: true }
//     );

//     if (!workspaceUser) return res.status(404).json({ success: false, message: "Workspace user not found" });
//     res.status(200).json({ success: true, data: workspaceUser });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const updateWorkspaceUser = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, userId } = req.params;

    // Allowed roles for workspace users
    const allowedRoles = ["editor", "viewer"];

    // Check if requested role is valid
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Only Admin can change roles (req.user.role comes from auth middleware)
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can change user roles" });
    }

    // Step 1: Update workspace user role
    const workspaceUser = await WorkspaceUser.findOneAndUpdate(
      { workspaceId: id, userId },
      { role },
      { new: true }
    ).populate("userId");

    if (!workspaceUser) {
      return res.status(404).json({ success: false, message: "Workspace user not found" });
    }

    // Step 2: Update the global User role to match new workspace role
    await User.findByIdAndUpdate(userId, { role });

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: workspaceUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWorkspaceUser = async (req, res) => {
  try {
    const workspaceUser = await WorkspaceUser.findOneAndDelete({ 
      workspaceId: req.params.id, 
      userId: req.params.userId 
    });

    if (!workspaceUser) return res.status(404).json({ success: false, message: "Workspace user not found" });
    res.status(200).json({ success: true, message: "Workspace user removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
