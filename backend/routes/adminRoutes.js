import express from 'express';
const router = express.Router();
import  adminOnly  from "../middlewares/roleMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js'
import {
  listWorkspaces,
  createWorkspace,
  viewWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listWorkspaceUsers,
  addWorkspaceUser,
  viewWorkspaceUser,
  updateWorkspaceUser,
  deleteWorkspaceUser
} from "../controllers/adminController.js";

// Workspaces CRUD
router.get("/workspaces", authMiddleware, adminOnly('admin'), listWorkspaces);
router.post("/workspaces", authMiddleware, adminOnly('admin'), createWorkspace);
router.get("/workspaces/:id", authMiddleware, adminOnly('admin'), viewWorkspace);
router.put("/workspaces/:id", authMiddleware, adminOnly('admin'), updateWorkspace);
router.delete("/workspaces/:id", authMiddleware, adminOnly('admin'), deleteWorkspace);

// // Workspace Users CRUD
router.get("/workspaces/:id/users", authMiddleware, adminOnly('admin'),listWorkspaceUsers);
router.post("/workspaces/:id/users", authMiddleware, adminOnly('admin'),addWorkspaceUser);
router.get("/workspaces/:id/users/:userId", authMiddleware, adminOnly('admin'), viewWorkspaceUser);
router.put("/workspaces/:id/users/:userId", authMiddleware, adminOnly('admin'), updateWorkspaceUser);
router.delete("/workspaces/:id/users/:userId", authMiddleware, adminOnly('admin'), deleteWorkspaceUser);

export default router; // Export the router to use it in other files