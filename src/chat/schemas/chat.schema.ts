import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';  //Import Mongoose separately for ObjectId

//Define the Chat schema using @Schema and @Prop decorators
@Schema()
export class Chat extends Document {
  @Prop({ required: true }) 
  gameId: string;

  @Prop([{ 
    userIdMongo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //Use mongoose.Schema.Types.ObjectId
    userId: {type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }])
  messages: {
    userIdMongo: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
  }[];
}

// Create the schema using SchemaFactory
export const ChatSchema = SchemaFactory.createForClass(Chat);
