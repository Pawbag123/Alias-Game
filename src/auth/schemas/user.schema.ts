import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Stats } from 'src/types';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true})
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({
    type: Object,
    required: true,
    default: {
      gamesPlayed: 0,
      wins: 0,
      loses: 0,
      draw: 0,
      wordsGuessed: 0,
      wellDescribed: 0,
    },
  })
  stats: Stats;
}

export const UserSchema = SchemaFactory.createForClass(User);
