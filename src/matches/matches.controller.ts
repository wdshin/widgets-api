import { Controller, Get } from '@nestjs/common';
import { Matches } from './matches.schema';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
  ) {
  }

  @Get('/')
  async getMatches(): Promise<Matches[]> {
    return this.matchesService.getMatches();
  }
}
