import { Injectable } from '@nestjs/common'
import { getWinrate } from 'src/common/dota.functions'
import OpendotaService from 'src/common/OpendotaService'
import { HeroesService } from 'src/heroes/heroes.service'
import { PlayersService } from 'src/players/players.service'
import { TeamsService } from 'src/teams/teams.service'

@Injectable()
export class StatService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly teamsService: TeamsService,
    private readonly heroesService: HeroesService,
  ) {}

  public async getOverlayPlayerInfo(playerId: number): Promise<object> {
    const player = await this.playersService.getPlayerById(playerId)

    const [team, patchWinLose, days7WinLose, days1WinLose, playerHeroes] = await Promise.all([
      this.teamsService.getTeamById(player.team_id),
      OpendotaService.getWinLose(playerId, null, OpendotaService.CURRENT_PATCH),
      OpendotaService.getWinLose(playerId, 7),
      OpendotaService.getWinLose(playerId, 1),
      OpendotaService.getPlayerHeroes(playerId, null, OpendotaService.CURRENT_PATCH),
    ])

    // sort and get top 3 heroes
    playerHeroes.sort((a, b) => b.games * getWinrate(b.win, b.games - b.win) - a.games * getWinrate(a.win, a.games - a.win))
    playerHeroes.splice(3)

    const playerTopHeroes = await Promise.all(
      playerHeroes.map(async h => {
        const hero = await this.heroesService.getHeroById(Number(h.hero_id))
        return {
          hero_id: hero.id,
          hero_name: hero.localized_name,
          hero_img: hero.img,
          winrate: getWinrate(h.win, h.games - h.win),
        }
      })
    )

    return {
      player_id: player.account_id,
      player_nickname: player.name,
      player_real_name: player.real_name,
      player_earnings: player.prize,
      player_img: player.img,
      team_name: team.name,
      team_logo: team.logo_url,
      player_top_heroes: playerTopHeroes,
      player_stat: [
        {
          field: ['Матчей в патче', 'Winrate'],
          value: [patchWinLose.win + patchWinLose.lose, getWinrate(patchWinLose.win, patchWinLose.lose)],
        },
        {
          field: ['Матчей за эту неделю', 'Winrate'],
          value: [days7WinLose.win + days7WinLose.lose, getWinrate(days7WinLose.win, days7WinLose.lose)],
        },
        {
          field: ['Матчей за сегодня', 'Winrate'],
          value: [days1WinLose.win + days1WinLose.lose, getWinrate(days1WinLose.win, days1WinLose.lose)],
        },
      ],
    }
  }
}
