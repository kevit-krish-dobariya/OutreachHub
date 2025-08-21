// src/auth/schemas/blacklisted-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BlacklistedToken extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, index: { expires: 0 } }) 
  expiresAt: Date;  // MongoDB TTL will auto-delete when this date is reached
}

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);