import { Injectable } from '@nestjs/common';
import { GameStateService } from 'src/shared/game-state.service';
import { Team } from 'src/lobby/types';
import { GameRoomGateway } from './game-room.gateway';

@Injectable()
export class GameMechanicsService {
  constructor(
    private readonly gameStateService: GameStateService,
  ) {
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
      "apple", "banana", "grape", "orange", "peach", "lemon", "cherry", "mango", "plum", "melon", "kiwi", "strawberry", "blueberry", "pineapple", "watermelon", "pear", "papaya", "coconut",
      // Animals
      "elephant", "giraffe", "zebra", "tiger", "lion", "panda", "whale", "eagle", "falcon", "rabbit", "dog", "cat", "mouse", "horse", "cow", "sheep", "chicken", "duck", "frog", "snake", "owl",
      // Household Items
      "house", "garden", "window", "door", "kitchen", "bedroom", "roof", "fence", "garage", "chimney", "table", "chair", "couch", "lamp", "cup", "plate", "fork", "knife", "spoon", "mirror", "clock",
      // Technology
      "laptop", "keyboard", "mouse", "screen", "printer", "tablet", "phone", "camera", "speaker", "headphones", "charger", "router", "television", "remote", "monitor", "smartphone", "battery", "USB", "bluetooth",
      // Vehicles
      "car", "bicycle", "bus", "train", "airplane", "helicopter", "submarine", "motorcycle", "skateboard", "truck", "boat", "scooter", "van", "trailer", "ship", "taxi", "hoverboard",
      // Music Instruments
      "guitar", "piano", "drums", "trumpet", "flute", "violin", "saxophone", "tambourine", "cello", "harp", "clarinet", "accordion", "trombone", "banjo", "xylophone", "harmonica", "keyboard",
      // Nature
      "mountain", "river", "forest", "beach", "desert", "valley", "volcano", "lake", "island", "cave", "hill", "waterfall", "field", "ocean", "jungle", "prairie", "meadow", "reef", "savannah",
      // Literature
      "book", "magazine", "newspaper", "novel", "dictionary", "encyclopedia", "poem", "journal", "biography", "atlas", "comic", "manual", "guide", "story", "fiction", "nonfiction", "essay",
      // Clothing
      "shirt", "pants", "dress", "jacket", "hat", "scarf", "shoes", "socks", "gloves", "belt", "skirt", "tie", "sweater", "blouse", "coat", "jeans", "shorts", "sandals", "boots",
      // Sports
      "soccer", "tennis", "basketball", "baseball", "golf", "swimming", "cycling", "running", "skiing", "surfing", "hockey", "volleyball", "boxing", "skating", "archery", "climbing", "diving",
      // Food
      "bread", "butter", "cheese", "milk", "egg", "yogurt", "chocolate", "honey", "sugar", "salt", "pepper", "pizza", "burger", "sandwich", "pasta", "rice", "salad", "soup", "cake", "cookie", "pie", "icecream", "coffee", "tea",
      // Colors
      "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", "gray", "cyan", "magenta", "gold", "silver", "turquoise", "beige", "maroon", "navy", "teal"
    ];

    let selectedWord: string;

    do {
      const wordIndex = this.getRandomNumber(0, words.length - 1);
      selectedWord = words[ wordIndex ];
    } while (wordsUsed.includes(selectedWord));

    return selectedWord;
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* async turns(gameId: string) {
    let rounds = 0;
                       //? const game = this.gameStateService.getGameById(gameId)
    console.log("ENTRO EN TURNS DE MECANICS");
    await this.delay(10000);

    while(rounds < 6)
    {
      this.newWord(gameId);
      this.nextTurn(gameId);
      //! Comunicates with gateWay to send the clientes the changes made in teams, describer and word.
      console.log("LOG INSIDE THE WHILE: ", this.gameStateService.getGameById(gameId))
      await this.delay(10000);
      rounds ++;
    }
  } 
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  } */

  nextTurn(gameId: string) {
    const game = this.gameStateService.getGameById(gameId);

    // Initialize game and set the first turn if it's not already set
    if (!game.turn) {
      const teamPlayers = game.players.filter(player => player.team === Team.RED || player.team === Team.BLUE);

      if (teamPlayers.length === 0) {
        throw new Error('No players available in teams');
      }

      // Randomly pick a player from the teamPlayers array
      const randomIndex = Math.floor(Math.random() * teamPlayers.length);
      const randomPlayer = teamPlayers[ randomIndex ];

      game.turn = {
        alreadyDiscribe: [],
        team: randomPlayer.team,
        describer: randomPlayer.userId
      };

      // Optionally set the first word
      game.currentWord = this.generateWord(game.wordsUsed);
    } else {
      // Existing turn logic for subsequent turns
      game.turn.alreadyDiscribe.push(game.turn.describer);

      // Switch team
      const oppositeTeam = game.turn.team === Team.RED ? Team.BLUE : Team.RED;
      game.turn.team = oppositeTeam;

      const nextDescriber = game.players.find(player =>
        player.team === oppositeTeam && !game.turn.alreadyDiscribe.includes(player.userId)
      );

      if (nextDescriber) {
        game.turn.describer = nextDescriber.userId;
      } else {
        game.turn.alreadyDiscribe = game.turn.alreadyDiscribe.filter(playerId =>
          game.players.some(player => player.userId === playerId && player.team !== oppositeTeam)
        );

        game.turn.describer = game.players.find(player => player.team === oppositeTeam)?.userId || '';
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

  playerGuessed(gameId: string) {
    const game = this.gameStateService.getGameById(gameId);
    const { turn, score } = game;

    if (turn.team === 'redTeam') {
      score[ 0 ] += 1;
    } else if (turn.team === 'blueTeam') {
      score[ 1 ] += 1;
    }

    this.newWord(gameId);

    this.gameStateService.saveCurrentState(game);
    return game;
  }

  validateWord(userId: string, gameId: string, message: string) {
    const game = this.gameStateService.getGameById(gameId);
    const { turn, currentWord } = game;
  
    if (game.isGameStarted && turn) {
      // Find the player's team
      const player = game.players.find(p => p.userId === userId);
      if (!player) {
        console.log("Player not found!");
        return message; // Early return if player not found
      }
  
      if (player.team === turn.team) {
  
        if (turn.describer === userId) {
  
          if (message.toLowerCase() === currentWord.toLowerCase()) {
            // Return the word censored with *
            const censoredWord = currentWord.replace(/./g, '*');
            return censoredWord;
          } else {
            return message;
          }
  
        } else {
          // The player is guessing
  
          // Compare the guess with the current word
          if (message.toLowerCase() === currentWord.toLowerCase()) {
            this.playerGuessed(gameId);
            return message = `${message} ✅`;
          } else {
            // Return the message normally if it's a wrong guess
            return message;
          }
        }
  
      } else {
        // It's not the player's team's turn
        return message;
      }
  
    } else {
      // Game hasn't started or turn is null
      return message;
    }
  }
}