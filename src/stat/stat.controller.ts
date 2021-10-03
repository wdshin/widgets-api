import { Controller, Get, Query } from '@nestjs/common'
import { StatService } from './stat.service'

@Controller('stat')
export class StatController {
  constructor(
    private readonly statService: StatService,
  ) {
  }

  /**
   * Get info for Player overlay
   * 
   * @param id Player id 
   * @returns info object
   */
  @Get('/overlay/player')
  async getPlayerInfo(
    @Query('id') id: number
  ): Promise<object> {
    return this.statService.getOverlayPlayerInfo(id)
  }

  /**
   * Get number of times teams playes agaisnt
   * each other and winrate
   * 
   * @param team1Id
   * @param team2Id
   * @returns info object
   */
   @Get('/overlay/team/confrontation')
   async getTeamsConfrontation(
     @Query('team1') team1Id: string,
     @Query('team2') team2Id: string,
   ): Promise<object> {
     return this.statService.getTeamsConfrontation(Number(team1Id), Number(team2Id))
   }
}
