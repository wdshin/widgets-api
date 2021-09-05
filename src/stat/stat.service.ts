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
    let playerTopHeroes = []

    const [team, patchWinLose, days7WinLose, days1WinLose, playerHeroes] = await Promise.all([
      this.teamsService.getTeamById(player.team_id),
      OpendotaService.getWinLose(playerId, null, OpendotaService.CURRENT_PATCH),
      OpendotaService.getWinLose(playerId, 7),
      OpendotaService.getWinLose(playerId, 1),
      OpendotaService.getPlayerHeroes(playerId, null, OpendotaService.CURRENT_PATCH),
    ])

    // sort and get top 3 heroes
    if (playerHeroes) {
      playerHeroes.sort((a, b) => b.games * getWinrate(b.win, b.games - b.win) - a.games * getWinrate(a.win, a.games - a.win))
      playerHeroes.splice(3)

      playerTopHeroes = await Promise.all(
        playerHeroes.map(async h => {
          const hero = await this.heroesService.getHeroById(Number(h.hero_id))
          return {
            hero_id: hero.id,
            hero_name: hero.localized_name,
            hero_img: hero.img,
            winrate: getWinrate(h.win, h.games - h.win),
            games: h.games,
          }
        })
      )  
    }

    
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

  public async getTeamsConfrontation(team1Id: number, team2Id: number): Promise<object> {
    const [
      team1Matches,
      team1,
      team2,
    ] = await Promise.all([
      OpendotaService.getTeamMatches(team1Id),
      this.teamsService.getTeamById(team1Id),
      this.teamsService.getTeamById(team2Id),
    ])

    const lastYear = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)

    const matchesAgainst = team1Matches.filter(match => match.opposing_team_id === team2Id)
    const matchesAgainstLastYear = matchesAgainst.filter(match => new Date(match.start_time * 1000) > lastYear)

    const winTotal = matchesAgainst.filter(match => match.radiant === match.radiant_win)
    const winLastYear = matchesAgainstLastYear.filter(match => match.radiant === match.radiant_win)

    return {
      team1_id: team1.team_id,
      team1_logo: team1.logo_url,
      team1_name: team1.name,
      team2_id: team2.team_id,
      team2_logo: team2.logo_url,
      team2_name: team2.name,
      matches_against_total: matchesAgainst.length,
      matches_against_last_year: matchesAgainstLastYear.length,
      team1_winrate_total: getWinrate(winTotal.length, matchesAgainst.length - winTotal.length),
      team1_winrate_last_year: getWinrate(winLastYear.length, matchesAgainstLastYear.length - winLastYear.length),
    }
  }

  public async getTeamWinrateMatchDuration(teamId: number): Promise<object> {
    const [
      teamMatches,
      teamInfo,
    ] = await Promise.all([
      OpendotaService.getTeamMatches(teamId),
      this.teamsService.getTeamById(teamId),
    ])

    const lastYear = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
    const _40min = 40 * 60, longer = [], shorter = []

    for (let i = 0; i < teamMatches.length; ++i) {
      const match = teamMatches[i]

      if (new Date(match.start_time * 1000) < lastYear) continue

      if (match.duration > _40min) {
        longer.push(match)
      } else {
        shorter.push(match)
      }
    }

    const winShorter = shorter.filter(match => match.radiant === match.radiant_win)
    const winLonger = longer.filter(match => match.radiant === match.radiant_win)

    return {
      team_id: teamInfo.team_id,
      team_logo: teamInfo.logo_url,
      team_name: teamInfo.name,
      games_longer: longer.length,
      games_shorter: shorter.length,
      winrate_longer: getWinrate(winLonger.length, longer.length - winLonger.length),
      winrate_shorter: getWinrate(winShorter.length, shorter.length - winShorter.length)
    }
  }
}
