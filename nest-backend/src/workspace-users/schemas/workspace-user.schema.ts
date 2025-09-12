import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workspace } from '../../workspaces/schemas/workspaces.schema';
import { User } from '../../auth/schemas/user.schema';

export type WorkspaceUserDocument = WorkspaceUser & Document;

export enum WorkspaceRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class WorkspaceUser {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId | Workspace;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: String, enum: WorkspaceRole, default: WorkspaceRole.VIEWER })
  role: WorkspaceRole;
}

export const WorkspaceUserSchema = SchemaFactory.createForClass(WorkspaceUser);
