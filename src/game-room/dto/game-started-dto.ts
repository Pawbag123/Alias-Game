import { Expose } from 'class-transformer';

export class GameStartedDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  host: string;

  @Expose()
  isGameStarted: boolean;

  @Expose()
  redTeam: [string, boolean][];

  @Expose()
  blueTeam: [string, boolean][];

  @Expose()
  noTeam: [string, boolean][];
}
