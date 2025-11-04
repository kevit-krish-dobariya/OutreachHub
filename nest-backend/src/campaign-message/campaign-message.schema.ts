// src/campaign-messages/schemas/campaign-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CampaignMessageDocument = CampaignMessage & Document;

@Schema({ timestamps: true })
export class CampaignMessage {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true })
  workspace: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true })
  campaign: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contact', required: true })
  contactIds: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  messageContent: string;

  @Prop({ default: Date.now })
  sentAt: Date;
}

export const CampaignMessageSchema = SchemaFactory.createForClass(CampaignMessage);

// Index to ensure uniqueness or faster queries for campaign-contact combinations
CampaignMessageSchema.index({ campaign: 1, contactIds: 1 });
