import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkspaceUser, WorkspaceUserDocument, WorkspaceRole } from './schemas/workspace-user.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/schemas/workspaces.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import mongoose from 'mongoose';



@Injectable()
export class WorkspaceUsersService {
  constructor(
    @InjectModel(WorkspaceUser.name) private workspaceUserModel: Model<WorkspaceUserDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}


async addUserToWorkspace(workspaceId: string, userId: string, role: string) {
  // 1. Fetch user
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  // 2. Update user's role if different
  if (user.role !== role) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { role: role } }
    );
  }

  // 3. Add to workspaceUsers table
  const workspaceUser = await this.workspaceUserModel.create({
    workspace: new mongoose.Types.ObjectId(workspaceId),
    user: new mongoose.Types.ObjectId(userId),
    role,
  });

  return workspaceUser;
}


async updateWorkspaceUserRole(workspaceUserId: string, role: string) {
  // 1. Get the workspace user entry (no populate needed)
  const workspaceUser = await this.workspaceUserModel.findById(workspaceUserId);
  if (!workspaceUser) {
    throw new NotFoundException('Workspace user not found');
  }

  // 2. Handle populated and non-populated user field
  let userId: string;
  if (workspaceUser.user && typeof workspaceUser.user === 'object' && '_id' in workspaceUser.user) {
    // Populated user object
    userId = (workspaceUser.user as any)._id.toString();
  } else {
    // Plain ObjectId
    userId = workspaceUser.user.toString();
  }

  // 3. Fetch the user document
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 4. Update user's role if different
  if (user.role !== role) {
    await this.userModel.updateOne({ _id: userId }, { $set: { role } });
  }

  // 5. Update workspace user role if different
 if (!Object.values(WorkspaceRole).includes(role as WorkspaceRole)) {
  throw new BadRequestException('Invalid role');
}

workspaceUser.role = role as WorkspaceRole;
    await workspaceUser.save();
  
  return workspaceUser;
}



  async removeUser(id: string) {
    const workspaceUser = await this.workspaceUserModel.findById(id);
    if (!workspaceUser) throw new NotFoundException('Workspace user not found');

    await this.workspaceUserModel.findByIdAndDelete(id);
    return { message: 'Workspace user removed' };
  }

  async getUsersForWorkspace(workspaceId: string) {
    return this.workspaceUserModel
      .find({ workspace: workspaceId })
      .populate('user');
  }
}
