import { Expose } from 'class-transformer';

export class InLobbyGameDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  players: number;

  @Expose()
  maxPlayers: number;

  @Expose()
  started: boolean;
}
