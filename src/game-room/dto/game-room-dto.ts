import { Expose } from 'class-transformer';

export class GameRoomDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  host: string;

  @Expose()
  isGameStarted: boolean;

  @Expose()
  redTeam: string[];

  @Expose()
  blueTeam: string[];

  @Expose()
  noTeam: string[];
}
