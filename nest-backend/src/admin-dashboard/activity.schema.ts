import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';

// This enum can be expanded with more actions as your application grows
export enum ActivityAction {
  USER_CREATED = 'Created User',
  WORKSPACE_CREATED = 'Created Workspace',
  CAMPAIGN_DELETED = 'Deleted Campaign',
  USER_ADDED_TO_WORKSPACE = 'Added User to Workspace',
}

export enum ActivityStatus {
    SUCCESS = 'Success',
    FAILED = 'Failed',
    PENDING = 'Pending',
    REMOVED = 'Removed'
}

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User; // The user who performed the action

  @Prop({ type: String, enum: ActivityAction, required: true })
  action: ActivityAction;

  @Prop({ type: String, enum: ActivityStatus, required: true })
  status: ActivityStatus;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
