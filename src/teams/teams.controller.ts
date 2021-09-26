import { Controller, Get, Param } from '@nestjs/common';
import { Players } from 'src/players/players.schema';
import { Teams } from './teams.schema';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
  ) {
  }

  @Get('/:team_id')
  async getTeam(
    @Param('team_id') teamId: number,
  ): Promise<Teams> {
    return this.teamsService.getTeamById(teamId);
  }

  @Get('/:team_id/players')
  async getTeamPlayers(
    @Param('team_id') teamId: number,
  ): Promise<Players[]> {
    return this.teamsService.getTeamPlayers(teamId);
  }

  @Get('/')
  async getTeams(): Promise<Teams[]> {
    return this.teamsService.getTeams();
  }
}
