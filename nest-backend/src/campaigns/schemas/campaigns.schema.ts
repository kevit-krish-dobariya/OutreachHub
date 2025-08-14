import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workspace } from '../../workspaces/schemas/workspaces.schema';
import { User } from '../../auth/schemas/user.schema';

export type CampaignDocument = Campaign & Document;

export enum CampaignStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Contact', default: [] })
  contacts: Types.ObjectId[];

  @Prop({ type: String, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus; // draft, running, or completed
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
