// src/campaigns/schemas/campaign.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['Draft', 'Running', 'Completed'],
    default: 'Draft',
  })
  status: string;

  @Prop({ type: [String], default: [] })
  selectedTags: string[];

  @Prop()
  startDate?: string;

  @Prop()
  startTime?: string;

  @Prop()
  endDate?: string;

  @Prop()
  endTime?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MessageTemplate' })
  templateId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// compound index for workspace + status queries
CampaignSchema.index({ workspaceId: 1, status: 1 });
