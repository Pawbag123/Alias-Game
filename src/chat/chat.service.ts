import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import mongoose, { Model } from 'mongoose';
import { GameStateService } from 'src/shared/game-state.service';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) 
  private readonly chatModel: Model<Chat>,
) {}

  async handleChatMessage(userId: string, userName: string, gameId: string, message: string) {
    const timestamp = new Date();

    //Create objec of new chat message
    const newMessage = {
      userId,
      userName,
      content: message,
      timestamp
    }

    // Save message to the database
    const chat = await this.chatModel.findOneAndUpdate(
      { gameId }, 
      { $push: { messages: newMessage } }, 
      { new: true, upsert: true }
    );

    //Get the last message's Id
    const addedMessage = chat.messages[chat.messages.length - 1]

    return { userId, userName, gameId, message, time: timestamp, messageId: addedMessage._id};
  }

  //Don't work refreshing the game room, freezes the view, the rest of the players can see the messages typed tough
  async getMessagesAfter(lastMessageId: mongoose.Schema.Types.ObjectId, gameId: string) {
    const chatDocument = await this.chatModel.findOne({ gameId }).exec(); // Fetch the entire document

    // Check if the chatDocument exists and has messages
    if(chatDocument && chatDocument.messages && chatDocument.messages.length > 0) {
      // Filter messages based on the lastMessageId
      const recoveredMessages = chatDocument.messages.map(message => {
        return {
          userId: message.userId,
          userName: message.userName,
          gameId,
          message: message.content,
          time: message.timestamp,
          messageId: message._id
        };
      });

      // Return the filtered messages
      return recoveredMessages;
    } else {
      return [];
    }
  }
  
}
