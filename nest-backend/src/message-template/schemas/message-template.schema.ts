import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageTemplateDocument = MessageTemplate & Document;

@Schema({ timestamps: true })
export class MessageTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Text', 'Text-Image'] })
  type: string;

  @Prop({ type: { text: { type: String, required: true }, imageUrl: String }, required: true })
  message: {
    text: string;
    imageUrl?: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const MessageTemplateSchema = SchemaFactory.createForClass(MessageTemplate);

// Index for workspaceId + type
MessageTemplateSchema.index({ workspaceId: 1, type: 1 });
