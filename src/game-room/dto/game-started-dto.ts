import { Expose } from 'class-transformer';
import { IngameStats, Turn } from 'src/types';

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
  turn: Turn;

  @Expose()
  currentWord: string | undefined;

  @Expose()
  score: {
    red: number;
    blue: number;
  };
}
