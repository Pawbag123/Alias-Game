import { Injectable } from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';
import { GameStateService } from 'src/shared/game-state.service';

@Injectable()
export class GameRoomService {
  constructor(private readonly gameStateService: GameStateService) {
    console.log('GameRoomService created');
  }

  //* Logic for transitioning a game from the lobby to the game room
  addPlayerToGame(gameId: string, userId: string, socketId: string): void {
    // const game = this.gameStateService.games.find((game) => game.id === gameId);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // if (
    //   !(
    //     game.redTeam.includes(userId) ||
    //     game.blueTeam.includes(userId) ||
    //     game.noTeam.includes(userId)
    //   )
    // )
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    // const user = this.gameStateService.activeUsers.find(
    //   (user) => user.id === userId,
    // );
    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.socketId) {
      throw new Error('User already in game');
    }

    if (user.gameId !== gameId) {
      throw new Error('User not added to this game');
    }

    //* Clear the timeout for removing the user from the game
    clearTimeout(user.initialJoinTimeout);
    delete user.initialJoinTimeout;

    //* Add current socket ID to user
    user.socketId = socketId;
  }

  removePlayerFromGame(gameId: string, userId: string): void {
    console.log('in remove');
    this.gameStateService.displayGames();
    this.gameStateService.displayActiveUsers();
    // const game = this.gameStateService.games.find((game) => game.id === gameId);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // const user = this.gameStateService.activeUsers.find(
    //   (user) => user.id === userId,
    // );
    const user = this.gameStateService.getActiveUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.gameId !== gameId) {
      throw new Error('User not in this game');
    }

    console.log('my game', game);

    //* Remove user from game
    // game.redTeam = game.redTeam.filter((id) => id !== userId);
    // game.blueTeam = game.blueTeam.filter((id) => id !== userId);
    // game.noTeam = game.noTeam.filter((id) => id !== userId);
    this.gameStateService.removeUserFromGame(userId, gameId);
    console.log('my game after removing user', game);

    // this.gameStateService.activeUsers =
    //   this.gameStateService.activeUsers.filter((user) => user.id !== userId);
    this.gameStateService.removeActiveUser(userId);
    console.log('my game after deleting user', game);

    // if (
    //   game.host === userId &&
    //   game.redTeam.length + game.blueTeam.length + game.noTeam.length > 0
    // )
    if (
      this.gameStateService.isGameHost(userId, gameId) &&
      !this.gameStateService.isGameEmpty(gameId)
    ) {
      // game.host = game.redTeam[0] || game.blueTeam[0] || game.noTeam[0];
      this.gameStateService.moveHostToNextUser(gameId);
      // } else if (
      //   game.redTeam.length + game.blueTeam.length + game.noTeam.length ===
      //   0
      // )
    } else if (this.gameStateService.isGameEmpty(gameId)) {
      this.gameStateService.removeGameRoom(gameId);
    }

    //* Remove user from active users
  }

  joinRedTeam(gameId: string, userId: string): void {
    // const game = this.gameStateService.games.find((game) => game.id === gameId);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // if (
    //   !(
    //     game.redTeam.includes(userId) ||
    //     game.blueTeam.includes(userId) ||
    //     game.noTeam.includes(userId)
    //   )
    // ) {
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    if (game.noTeam.includes(userId)) {
      game.noTeam = game.noTeam.filter((id) => id !== userId);
      game.redTeam.push(userId);
    } else if (game.blueTeam.includes(userId)) {
      game.blueTeam = game.blueTeam.filter((id) => id !== userId);
      game.redTeam.push(userId);
    }
  }

  joinBlueTeam(gameId: string, userId: string): void {
    // const game = this.gameStateService.games.find((game) => game.id === gameId);
    const game = this.gameStateService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // if (
    //   !(
    //     game.redTeam.includes(userId) ||
    //     game.blueTeam.includes(userId) ||
    //     game.noTeam.includes(userId)
    //   )
    // ) {
    if (!this.gameStateService.isUserAllowedInGame(userId, gameId)) {
      throw new Error('User not allowed to join game');
    }

    if (game.noTeam.includes(userId)) {
      game.noTeam = game.noTeam.filter((id) => id !== userId);
      game.blueTeam.push(userId);
    } else if (game.redTeam.includes(userId)) {
      game.redTeam = game.redTeam.filter((id) => id !== userId);
      game.blueTeam.push(userId);
    }
  }

  // addPlayerToGame(gameId: string, userId: string, socketId: string) {
  //   return this.lobbyService.addPlayerToGame(gameId, userId, socketId);
  // }

  // removePlayerFromGame(gameId: string, userId: string) {
  //   return this.lobbyService.removePlayerFromGame(gameId, userId);
  // }

  // gameExists(gameId: string) {
  //   return this.lobbyService.gameExists(gameId);
  // }

  // findUserBySocketId(socketId: string) {
  //   return this.lobbyService.findUserBySocketId(socketId);
  // }

  //   getGameById(gameId: string) {
  //     return this.lobbyService.getGameById(gameId);
  //   }

  //   getActiveUserById(userId: string) {
  //     return this.lobbyService.getActiveUserById(userId);
  //   }
}
