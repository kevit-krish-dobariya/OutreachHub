import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({required:true})
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
