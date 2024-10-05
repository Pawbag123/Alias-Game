import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<Chat>) {}

  async handleChatMessage(userId: string, userName: string, gameId: string, message: string) {
    const timestamp = new Date();

    // Save message to the database
    const chat = await this.chatModel.findOneAndUpdate(
      { gameId }, 
      { $push: { messages: { userId, userName, content: message, timestamp } } }, 
      { new: true, upsert: true }
    );

    return { userId, userName, gameId, message, time: timestamp };
  }
}
