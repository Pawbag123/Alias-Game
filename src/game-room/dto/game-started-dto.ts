import { Expose } from 'class-transformer';
import { Team } from 'src/lobby/types';

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

  @Expose()
  turn: {
    alreadyDiscribe: string[];
    team: Team,
    describer: string,
    words: string[],
  }

  @Expose()
  score: [number, number]

}
