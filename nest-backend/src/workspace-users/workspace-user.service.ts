import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { WorkspaceUser, WorkspaceUserDocument, WorkspaceRole } from './schemas/workspace-user.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class WorkspaceUsersService {
  constructor(
    @InjectModel(WorkspaceUser.name) private workspaceUserModel: Model<WorkspaceUserDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Finds all WorkspaceUser entries for a given workspace and populates user details.
   */
  async findByWorkspace(workspaceId: string): Promise<WorkspaceUser[]> {
    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException('Invalid workspaceId format');
    }
    return this.workspaceUserModel
      .find({ workspace: new Types.ObjectId(workspaceId) })
      .populate({
        path: 'user',
        select: 'username email', // Only return necessary user fields
      })
      .exec();
  }

  /**
   * Adds a user to a workspace using their email address.
   * Throws an error if the user does not exist or is already in the workspace.
   */
  async addUserToWorkspace(workspaceId: string, email: string, role: WorkspaceRole): Promise<WorkspaceUser> {
    // 1. Find the user by their email address.
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }

    // 2. Check if the user is already a member of this workspace.
    const existingMember = await this.workspaceUserModel.findOne({
      workspace: new Types.ObjectId(workspaceId),
      user: user._id,
    });

    if (existingMember) {
      throw new ConflictException(`User "${email}" is already a member of this workspace.`);
    }

    // 3. Create the new workspace-user association.
    const newWorkspaceUser = new this.workspaceUserModel({
      workspace: new Types.ObjectId(workspaceId),
      user: user._id,
      role,
    });
    
    await newWorkspaceUser.save();
    
    // 4. Populate user details before returning for a complete response
    return newWorkspaceUser.populate({
        path: 'user',
        select: 'username email'
    });
  }

  async assignUserToWorkspace(
  workspaceId: string,
   userId: string,
  role: WorkspaceRole = WorkspaceRole.VIEWER,
) {
  // 1. Validate IDs
  if (!isValidObjectId(userId) || !isValidObjectId(workspaceId)) {
    throw new BadRequestException('Invalid userId or workspaceId');
  }

  // 2. Verify user exists
  const user = await this.userModel.findById(userId).select('username email').exec();
  if (!user) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  // 3. Check if already assigned
  const existing = await this.workspaceUserModel.findOne({
    user: new Types.ObjectId(userId),
    workspace: new Types.ObjectId(workspaceId),
  });
  if (existing) {
    throw new ConflictException(`User "${user.email}" is already assigned to this workspace`);
  }

  // 4. Create workspace-user association
  const workspaceUser = new this.workspaceUserModel({
    user: new Types.ObjectId(userId),
    workspace: new Types.ObjectId(workspaceId),
    role,
  });

  await workspaceUser.save();

  // 5. Return populated record for consistency
  return workspaceUser.populate({
    path: 'user',
    select: 'username email',
  });
}

  /**
   * Updates the role of a user within a workspace.
   */
    async updateWorkspaceUserRole(workspaceUserId: string, role: WorkspaceRole): Promise<WorkspaceUser> {
    // 1. Validate the incoming role
    if (!Object.values(WorkspaceRole).includes(role)) {
      throw new BadRequestException(`Invalid role specified.`);
    }

    // 2. Find the workspace-user document to get the user's ID
    const workspaceUser = await this.workspaceUserModel.findById(workspaceUserId);
    if (!workspaceUser) {
      throw new NotFoundException(`Workspace-user association with ID "${workspaceUserId}" not found.`);
    }

    // 3. Perform both database updates concurrently
    await Promise.all([
      // Update 1: Change the role in the main 'users' collection
      this.userModel.findByIdAndUpdate(workspaceUser.user, { $set: { role } }),
      // Update 2: Change the role in the 'workspace_users' collection
      this.workspaceUserModel.findByIdAndUpdate(workspaceUserId, { $set: { role } })
    ]);

    // 4. Fetch and return the updated document, populated with the user's details
    // to confirm the change to the frontend.
    const updatedDocument = await this.workspaceUserModel.findById(workspaceUserId)
      .populate({
        path: 'user',
        select: 'username email role' // Include role to show it's updated
      });

    if (!updatedDocument) {
      // This should ideally not happen if the above succeeded, but it's a good safeguard.
      throw new NotFoundException('Could not retrieve the updated workspace user.');
    }
    
    return updatedDocument;
  }

  /**
   * Removes a user's association from a workspace.
   */
  async removeUser(id: string): Promise<{ message: string }> {
    const result = await this.workspaceUserModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Workspace-user association with ID "${id}" not found.`);
    }
    return { message: 'User removed from workspace successfully.' };
  }
}

