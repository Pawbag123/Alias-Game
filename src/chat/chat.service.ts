import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import mongoose, { Model } from 'mongoose';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async handleChatMessage(
    userId: string,
    userName: string,
    gameId: string,
    message: string,
  ) {
    const timestamp = new Date();

    if (!this.isValidObjectId(userId)) {
      throw new Error('Invalid userId');
    }

    // Convert userId string to ObjectId
    const userIdObject = new mongoose.Types.ObjectId(userId);

    // Create object for the new chat message
    const newMessage = {
      userId: userIdObject,
      userName,
      content: message,
      timestamp,
    };

    // Save message to the database
    const chat = await this.chatModel.findOneAndUpdate(
      { gameId },
      { $push: { messages: newMessage } },
      { new: true, upsert: true },
    );

    //Get the last message's Id
    const addedMessage = chat.messages[chat.messages.length - 1];

    return {
      userId,
      userName,
      gameId,
      message,
      time: timestamp,
      messageId: addedMessage._id,
    };
  }

  async getMessagesAfter(
    lastMessageId: mongoose.Schema.Types.ObjectId,
    gameId: string,
  ) {
    const chatDocument = await this.chatModel.findOne({ gameId }).exec(); // Fetch the entire document

    // Check if the chatDocument exists and has messages
    if (
      chatDocument &&
      chatDocument.messages &&
      chatDocument.messages.length > 0
    ) {
      // Filter messages based on the lastMessageId
      const recoveredMessages = chatDocument.messages.map((message) => {
        return {
          userId: message.userId.toString(),
          userName: message.userName,
          gameId,
          message: message.content,
          time: message.timestamp,
          messageId: message._id,
        };
      });

      // Return the filtered messages
      return recoveredMessages;
    } else {
      return [];
    }
  }

  async recoverAndEmitMessages(client: any, gameId: string) {
    const lastMessageId = client.handshake.query.serverOffset ?? 0;
    const recoveredMessages = await this.getMessagesAfter(
      lastMessageId,
      gameId,
    );

    recoveredMessages.forEach((message) => {
      client.emit('chat:update', message);
    });
  }
}
