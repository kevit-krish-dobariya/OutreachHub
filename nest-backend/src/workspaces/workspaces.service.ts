import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspaces.schema';
import { WorkspaceUser, WorkspaceUserDocument, WorkspaceRole } from '../workspace-users/schemas/workspace-user.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(WorkspaceUser.name) private workspaceUserModel: Model<WorkspaceUserDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAllWorkspaces() {
  return this.workspaceModel.find();
}


  async createWorkspace(
  adminId: string,
  name: string,
  description: string,
  users: { userId: string; role: WorkspaceRole }[] = [] // default empty array
) {
  // Create workspace and link admin as creator
  const workspace = new this.workspaceModel({
    name,
    description,
    createdBy: adminId
  });
  await workspace.save();

  // Add admin to workspace with role 'admin'
  const admin = await this.userModel.findById(adminId);
  if (admin) {
    await new this.workspaceUserModel({
      user: admin._id,
      workspace: workspace._id,
      role: 'admin',
      createdBy: adminId
    }).save();
  }

  // Add other users if provided
  for (const u of users) {
    const user = await this.userModel.findById(u.userId);
    if (user) {
      await new this.workspaceUserModel({
        user: user._id,
        workspace: workspace._id,
        role: u.role,
        createdBy: adminId // ✅ admin is the creator
      }).save();
    }
  }

  return workspace;
}


  async updateWorkspace(id: string, updateData: Partial<Workspace>) {
    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');

    Object.assign(workspace, updateData);
    return workspace.save();
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');

    await this.workspaceModel.deleteOne({ _id: id });
    await this.workspaceUserModel.deleteMany({ workspace: id });

    return { message: 'Workspace deleted successfully' };
  }

  async getWorkspaceForUser(userId: string) {
    const link = await this.workspaceUserModel
      .findOne({ user: userId })
      .populate('workspace');

    if (!link) throw new ForbiddenException('You are not assigned to any workspace');
    return link.workspace;
  }
}


