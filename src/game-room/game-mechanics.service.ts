import { Injectable } from '@nestjs/common';
import { GameStateService } from 'src/game-state/game-state.service';
import { Team } from 'src/types';

@Injectable()
export class GameMechanicsService {
  constructor(private readonly gameStateService: GameStateService) {
    console.log('GameMechanicsService created');
  }

  startGame(gameId: string): void {
    // add validation
    this.gameStateService.setGameStarted(gameId);
  }

  reconnectPlayer(userId: string, gameId: string, socketId: string): void {
    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }
    if (user.gameId !== gameId) {
      throw new Error('User not added to this game');
    }
    if (user.socketId) {
      throw new Error('User already in game');
    }
    this.gameStateService.addPlayerSocketId(userId, socketId);
  }

  generateWord(wordsUsed: string[]): string {
    const words = [
      // Fruits
      'apple',
      'banana',
      'grape',
      'orange',
      'peach',
      'lemon',
      'cherry',
      'mango',
      'plum',
      'melon',
      'kiwi',
      'strawberry',
      'blueberry',
      'pineapple',
      'watermelon',
      'pear',
      'papaya',
      'coconut',
      // Animals
      'elephant',
      'giraffe',
      'zebra',
      'tiger',
      'lion',
      'panda',
      'whale',
      'eagle',
      'falcon',
      'rabbit',
      'dog',
      'cat',
      'mouse',
      'horse',
      'cow',
      'sheep',
      'chicken',
      'duck',
      'frog',
      'snake',
      'owl',
      // Household Items
      'house',
      'garden',
      'window',
      'door',
      'kitchen',
      'bedroom',
      'roof',
      'fence',
      'garage',
      'chimney',
      'table',
      'chair',
      'couch',
      'lamp',
      'cup',
      'plate',
      'fork',
      'knife',
      'spoon',
      'mirror',
      'clock',
      // Technology
      'laptop',
      'keyboard',
      'mouse',
      'screen',
      'printer',
      'tablet',
      'phone',
      'camera',
      'speaker',
      'headphones',
      'charger',
      'router',
      'television',
      'remote',
      'monitor',
      'smartphone',
      'battery',
      'USB',
      'bluetooth',
      // Vehicles
      'car',
      'bicycle',
      'bus',
      'train',
      'airplane',
      'helicopter',
      'submarine',
      'motorcycle',
      'skateboard',
      'truck',
      'boat',
      'scooter',
      'van',
      'trailer',
      'ship',
      'taxi',
      'hoverboard',
      // Music Instruments
      'guitar',
      'piano',
      'drums',
      'trumpet',
      'flute',
      'violin',
      'saxophone',
      'tambourine',
      'cello',
      'harp',
      'clarinet',
      'accordion',
      'trombone',
      'banjo',
      'xylophone',
      'harmonica',
      'keyboard',
      // Nature
      'mountain',
      'river',
      'forest',
      'beach',
      'desert',
      'valley',
      'volcano',
      'lake',
      'island',
      'cave',
      'hill',
      'waterfall',
      'field',
      'ocean',
      'jungle',
      'prairie',
      'meadow',
      'reef',
      'savannah',
      // Literature
      'book',
      'magazine',
      'newspaper',
      'novel',
      'dictionary',
      'encyclopedia',
      'poem',
      'journal',
      'biography',
      'atlas',
      'comic',
      'manual',
      'guide',
      'story',
      'fiction',
      'nonfiction',
      'essay',
      // Clothing
      'shirt',
      'pants',
      'dress',
      'jacket',
      'hat',
      'scarf',
      'shoes',
      'socks',
      'gloves',
      'belt',
      'skirt',
      'tie',
      'sweater',
      'blouse',
      'coat',
      'jeans',
      'shorts',
      'sandals',
      'boots',
      // Sports
      'soccer',
      'tennis',
      'basketball',
      'baseball',
      'golf',
      'swimming',
      'cycling',
      'running',
      'skiing',
      'surfing',
      'hockey',
      'volleyball',
      'boxing',
      'skating',
      'archery',
      'climbing',
      'diving',
      // Food
      'bread',
      'butter',
      'cheese',
      'milk',
      'egg',
      'yogurt',
      'chocolate',
      'honey',
      'sugar',
      'salt',
      'pepper',
      'pizza',
      'burger',
      'sandwich',
      'pasta',
      'rice',
      'salad',
      'soup',
      'cake',
      'cookie',
      'pie',
      'icecream',
      'coffee',
      'tea',
      // Colors
      'red',
      'blue',
      'green',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'black',
      'white',
      'gray',
      'cyan',
      'magenta',
      'gold',
      'silver',
      'turquoise',
      'beige',
      'maroon',
      'navy',
      'teal',
    ];

    let selectedWord: string;

    do {
      const wordIndex = this.getRandomNumber(0, words.length - 1);
      selectedWord = words[wordIndex];
    } while (wordsUsed.includes(selectedWord));

    return selectedWord;
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  nextTurn(gameId: string) {
    const game = this.gameStateService.getGameById(gameId);

    console.log('ENRTO A NEXT TURN: ', game.players);

    // Initialize game and set the first turn if it's not already set
    if (!game.turn) {
      const teamPlayers = game.players.filter(
        (player) => player.team === Team.RED || player.team === Team.BLUE,
      );

      // Randomly pick a player from the teamPlayers array
      const randomIndex = Math.floor(Math.random() * teamPlayers.length);
      const randomPlayer = teamPlayers[randomIndex];

      game.turn = {
        alreadyDiscribe: [],
        team: randomPlayer.team,
        describerId: randomPlayer.userId,
        describerName: randomPlayer.name,
      };

      // Optionally set the first word
      game.currentWord = this.generateWord(game.wordsUsed);
    } else {
      // Existing turn logic for subsequent turns
      game.turn.alreadyDiscribe.push(game.turn.describerId);

      // Switch team
      const oppositeTeam = game.turn.team === Team.RED ? Team.BLUE : Team.RED;
      game.turn.team = oppositeTeam;

      const nextDescriber = game.players.find(
        (player) =>
          player.team === oppositeTeam &&
          !game.turn.alreadyDiscribe.includes(player.userId),
      );

      if (nextDescriber) {
        game.turn.describerId = nextDescriber.userId;
        game.turn.describerName = nextDescriber.name;
      } else {
        game.turn.alreadyDiscribe = game.turn.alreadyDiscribe.filter(
          (playerId) =>
            game.players.some(
              (player) =>
                player.userId === playerId && player.team !== oppositeTeam,
            ),
        );

        const fallbackDescriber = game.players.find(
          (player) => player.team === oppositeTeam,
        );
        game.turn.describerId = fallbackDescriber?.userId || '';
        game.turn.describerName = fallbackDescriber?.name || '';
      }
    }

    this.gameStateService.saveCurrentState(game);
    return game;
  }

  newWord(gameId: string) {
    const game = this.gameStateService.getGameById(gameId);
    if (game.currentWord) {
      game.wordsUsed.push(game.currentWord);
    }
    game.currentWord = this.generateWord(game.wordsUsed);
    console.log('new word : ', game.currentWord);
    this.gameStateService.saveCurrentState(game);
  }

  playerGuessed(gameId: string, userId: string) {
    const game = this.gameStateService.getGameById(gameId);
    const { turn, score, players } = game;

    const guessingPlayer = players.find((player) => player.userId === userId);
    if (guessingPlayer) {
      guessingPlayer.inGameStats.wordsGuessed += 1;
    }

    const describer = players.find(
      (player) => player.userId === turn.describerId,
    );
    if (describer) {
      describer.inGameStats.wellDescribed += 1;
    }

    if (turn.team === 'redTeam') {
      score.red++;
    } else if (turn.team === 'blueTeam') {
      score.blue++;
    }

    this.newWord(gameId);
    this.gameStateService.saveCurrentState(game);
    return game;
  }

  validateWord(
    userId: string,
    gameId: string,
    message: string,
  ): [string, boolean] {
    message = message.replace(/✅/g, '');

    const game = this.gameStateService.getGameById(gameId);
    const { turn, currentWord } = game;
    if (game.isGameStarted && turn) {
      // Find the player's team
      const player = game.players.find((p) => p.userId === userId);
      if (!player) {
        console.log('Player not found!');
        return [message, false]; // Early return if player not found
      }
      if (player.team === turn.team) {
        // Check if the current player is the describer
        if (turn.describerId === userId) {
          // Check if the message is the current word or a derivative
          if (
            message.toLowerCase() === currentWord.toLowerCase() ||
            this.wordDerivates(message, currentWord)
          ) {
            // Return the word censored with *
            throw new Error('You cannot use derivatives of described word');
            const censoredWord = currentWord.replace(/./g, '*');
            return [censoredWord, false];
          } else {
            return [message, false];
          }
        } else {
          // The player is guessing
          // Compare the guess with the current word
          if (message.toLowerCase() === currentWord.toLowerCase()) {
            this.playerGuessed(gameId, userId);
            return [`${message} ✅`, true];
          } else {
            // Return the message normally if it's a wrong guess
            return [message, false];
          }
        }
      } else {
        // It's not the player's team's turn
        return [message, false];
      }
    } else {
      // Game hasn't started or turn is null
      return [message, false];
    }
  }

  wordDerivates(message: string, currentWord: string): boolean {
    const normalizedMessage = message.toLowerCase().replace(/[.,!?:;]/g, ''); // Remove punctuation
    const words = normalizedMessage.split(/\s+/); // Split message into words
    const baseWord = currentWord.toLowerCase();
    // Check if any word in the message is the base word or a derivative
    for (let word of words) {
      if (word === baseWord) {
        return true; // Exact match
      }
      if (this.isDerivative(word, baseWord)) {
        return true; // Found a derivative
      }
    }
    return false; // No match or derivative found
  }

  // Helper function to check for simple derivatives
  isDerivative(word: string, baseWord: string): boolean {
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly']; // Common suffixes
    const prefixes = ['un', 're', 'in', 'im', 'dis', 'non']; // Common prefixes

    // Check if the word contains baseWord with a prefix or suffix
    if (word.startsWith(baseWord) || word.endsWith(baseWord)) {
      return true;
    }

    // Check for simple pluralization or conjugation (additions to the end of the word)
    for (let suffix of suffixes) {
      if (word === baseWord + suffix || word === baseWord + 'e' + suffix) {
        return true;
      }
    }

    // Check for common prefixes (additions to the start of the word)
    for (let prefix of prefixes) {
      if (word === prefix + baseWord) {
        return true;
      }
    }

    return false;
  }
}
