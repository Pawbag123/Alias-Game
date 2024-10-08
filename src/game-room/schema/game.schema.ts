import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';  //Import Mongoose separately for ObjectId

@Schema()
export class Games extends Document {
  @Prop({ required: true })
  gameId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  chatIdMongo: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  host: string;

  @Prop([{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    team: { type: String, required: true },
  }])
  players: {
    userId: string,
    name: string,
    team: string,
  }[];

  @Prop({
    type: Object,
    required: true,
    default: { red: 0, blue: 0 },
  })
  score: {
    red: number;
    blue: number;
  };
}

// Create the schema using SchemaFactory
export const DbGameSchema = SchemaFactory.createForClass(Games);
