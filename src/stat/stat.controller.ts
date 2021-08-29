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
  async getTeam(
    @Query('id') id: number
  ): Promise<object> {
    return this.statService.getOverlayPlayerInfo(id)
  }
}
