import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { IngameStats } from 'src/lobby/types';

@Schema()
export class Games extends Document {
  @Prop({ required: true })
  gameId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  chatIdMongo: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  host: string;

  // Add inGameStats here
  @Prop([{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    team: { type: String, required: true },
    inGameStats: {
      wordsGuessed: { type: Number, required: true },
      wellDescribed: { type: Number, required: true },
    }
  }])
  players: {
    userId: string,
    name: string,
    team: string,
    inGameStats: IngameStats
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

  @Prop({ type: [String], required: true })
  wordsUsed: string[];
}

export const DbGameSchema = SchemaFactory.createForClass(Games);
