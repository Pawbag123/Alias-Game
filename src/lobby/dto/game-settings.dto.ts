import { Expose } from 'class-transformer';

export class GameSettingsDto {
  @Expose()
  gameName: string;

  @Expose()
  maxPlayers: number;

  @Expose()
  rounds: number;

  @Expose()
  time: number;
}
