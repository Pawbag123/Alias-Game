import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import mongoose from 'mongoose';

describe('ChatService', () => {
  let chatService: ChatService;
  let chatModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Chat.name),
          useValue: {
            findOneAndUpdate: jest.fn(),
            findOne: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    chatModel = module.get(getModelToken(Chat.name));
  });

  describe('handleChatMessage', () => {
    it('should handle a chat message and return message data', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const gameId = 'test-game-id';
      const message = 'Hello World';
      const userName = 'Test User';

      const chatMock = {
        messages: [
          {
            _id: new mongoose.Types.ObjectId(),
            content: message,
            timestamp: new Date(),
          },
        ],
      };

      chatModel.findOneAndUpdate.mockResolvedValue(chatMock);

      const result = await chatService.handleChatMessage(
        userId,
        userName,
        gameId,
        message,
      );

      expect(chatModel.findOneAndUpdate).toHaveBeenCalledWith(
        { gameId },
        {
          $push: {
            messages: expect.objectContaining({
              userId: expect.any(mongoose.Types.ObjectId),
              userName,
              content: message,
              timestamp: expect.any(Date),
            }),
          },
        },
        { new: true, upsert: true },
      );

      expect(result).toEqual({
        userId,
        userName,
        gameId,
        message,
        time: expect.any(Date),
        messageId: chatMock.messages[0]._id,
      });
    });

    it('should throw an error if userId is invalid', async () => {
      const invalidUserId = 'invalid-user-id';
      await expect(
        chatService.handleChatMessage(
          invalidUserId,
          'Test User',
          'test-game-id',
          'Hello',
        ),
      ).rejects.toThrow('Invalid userId');
    });
  });

  describe('getMessagesAfter', () => {
    it('should return messages after a given messageId', async () => {
      const lastMessageId =
        new mongoose.Types.ObjectId() as unknown as mongoose.Schema.Types.ObjectId;
      const gameId = 'test-game-id';

      const chatDocument = {
        messages: [
          {
            _id: lastMessageId,
            userId: new mongoose.Types.ObjectId(),
            userName: 'Test User',
            content: 'Test Message',
            timestamp: new Date(),
          },
        ],
      };

      chatModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(chatDocument),
      });

      const result = await chatService.getMessagesAfter(lastMessageId, gameId);

      expect(chatModel.findOne).toHaveBeenCalledWith({ gameId });

      expect(result).toEqual([
        {
          userId: expect.any(String),
          userName: 'Test User',
          gameId,
          message: 'Test Message',
          time: expect.any(Date),
          messageId: lastMessageId,
        },
      ]);
    });

    it('should return an empty array if no messages are found', async () => {
      const lastMessageId =
        new mongoose.Types.ObjectId() as unknown as mongoose.Schema.Types.ObjectId;

      chatModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await chatService.getMessagesAfter(
        lastMessageId,
        'test-game-id',
      );

      expect(result).toEqual([]);
    });
  });

  describe('recoverAndEmitMessages', () => {
    it('should recover and emit messages to the client', async () => {
      const clientMock = {
        handshake: { query: { serverOffset: 'lastMessageId' } },
        emit: jest.fn(),
      };
      const gameId = 'test-game-id';

      const recoveredMessages = [
        {
          userId: 'user1',
          userName: 'Test User 1',
          gameId,
          message: 'Hello',
          time: new Date(),
          messageId:
            new mongoose.Types.ObjectId() as unknown as mongoose.Schema.Types.ObjectId,
        },
        {
          userId: 'user2',
          userName: 'Test User 2',
          gameId,
          message: 'Hi',
          time: new Date(),
          messageId:
            new mongoose.Types.ObjectId() as unknown as mongoose.Schema.Types.ObjectId,
        },
      ];

      jest
        .spyOn(chatService, 'getMessagesAfter')
        .mockResolvedValue(recoveredMessages);

      await chatService.recoverAndEmitMessages(clientMock, gameId);

      expect(chatService.getMessagesAfter).toHaveBeenCalledWith(
        'lastMessageId',
        gameId,
      );
      expect(clientMock.emit).toHaveBeenCalledTimes(2);
      expect(clientMock.emit).toHaveBeenCalledWith(
        'chat:update',
        recoveredMessages[0],
      );
      expect(clientMock.emit).toHaveBeenCalledWith(
        'chat:update',
        recoveredMessages[1],
      );
    });
  });
});
