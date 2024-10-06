import { Injectable } from '@nestjs/common';
import { GameStateService } from 'src/shared/game-state.service';
import { GameStartedDto } from './dto/game-started-dto';
import { Team } from 'src/lobby/types';

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

  initGame(gameStartedDto : GameStartedDto){
    //! First turn of the game
    gameStartedDto.turn = {
      alreadyDiscribe: [],
      team: Team.RED,
      describer: gameStartedDto.redTeam[0][0],
      words: this.generateWords(10), // Change input to get different number of words
    }
    gameStartedDto.score = [0, 0]
    console.log("Before saving it ", gameStartedDto);
    // save whats happening in game in the state service
    this.gameStateService.saveCurrentState(gameStartedDto);
    return gameStartedDto;
  }


  generateWords(totalWords: number) {
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

    const resultWords: string[] = [];

    for (let i = 0; i < totalWords; i++) {
      const wordIndex = this.getRandomNumber(0, words.length - 1);
      resultWords.push(words[wordIndex]);
      words.splice(wordIndex, 1);
    }

    return resultWords;
  }
  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  nextTurn(currentState: GameStartedDto) {
    console.log('NEXT TURN FUNCTION');
    // Retrieve the current game state using the provided game ID
    const { turn, redTeam, blueTeam } = currentState;

    // Add the current describer to the already described list
    currentState.turn.alreadyDiscribe.push(turn.describer);

    // Check if the current team is RED and switch to BLUE
    if (currentState.turn.team === Team.RED) {
      currentState.turn.team = Team.BLUE;

      // Look for a new describer in the blue team
      for (let i = 0; i < blueTeam.length; i++) {
        // Check if the player has not already described
        if (!currentState.turn.alreadyDiscribe.includes(blueTeam[ i ][ 0 ])) {
          currentState.turn.describer = blueTeam[ i ][ 0 ];
          return currentState; 
        }
      }

      currentState.turn.alreadyDiscribe = currentState.turn.alreadyDiscribe.filter(playerId => 
        !blueTeam.some(player => player[0] === playerId)
      );
      currentState.turn.describer = blueTeam[0][0];
      return currentState; 

    } else {
      // Switch to the RED team
      currentState.turn.team = Team.RED;

      // Look for a new describer in the red team
      for (let i = 0; i < redTeam.length; i++) {
        // Check if the player has not already described
        if (!currentState.turn.alreadyDiscribe.includes(redTeam[ i ][ 0 ])) {
          currentState.turn.describer = redTeam[ i ][ 0 ]; // Assign the first eligible player as describer
          return currentState; // Exit the function once a describer is found
        }
      }
      
      currentState.turn.alreadyDiscribe = currentState.turn.alreadyDiscribe.filter(playerId => 
        !redTeam.some(player => player[0] === playerId)
      );
      currentState.turn.describer = redTeam[0][0];
      return currentState; 
    }
  }
}
