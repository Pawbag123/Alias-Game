import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InGameStats } from 'src/types';

@Schema()
export class Games extends Document {
  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true })
  host: string;

  @Prop([
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      team: { type: String, required: true },
      inGameStats: {
        wordsGuessed: { type: Number, required: true },
        wellDescribed: { type: Number, required: true },
      },
    },
  ])
  players: {
    userId: string;
    name: string;
    team: string;
    inGameStats: InGameStats;
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
