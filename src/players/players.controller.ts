import { Controller, Get, Param } from '@nestjs/common';
import { Players } from './players.schema';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
  ) {
  }

  @Get('/:id')
  async getPlayer(
    @Param('id') id: number,
  ): Promise<Players> {
    return this.playersService.getPlayerById(id);
  }

  @Get('/')
  async getPlayers(): Promise<Players[]> {
    return this.playersService.getPlayers();
  }
}
