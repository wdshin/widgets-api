import { Injectable } from '@nestjs/common'
import { getWinrate, getWinrateByMatchDuration } from 'src/common/dota.functions'
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
      player_country_code: player.country_code,
      player_country_img: `https://www.worldometers.info/img/flags/${player.country_code}-flag.gif`,
      team_name: team.name,
      team_logo: team.logo_url,
      player_top_heroes: playerTopHeroes,
      player_stat: {
        games_patch: patchWinLose.win + patchWinLose.lose,
        games_week: days7WinLose.win + days7WinLose.lose,
        games_today: days1WinLose.win + days1WinLose.lose,
        winrate_patch: getWinrate(patchWinLose.win, patchWinLose.lose),
        winrate_week: getWinrate(days7WinLose.win, days7WinLose.lose),
        winrate_today: getWinrate(days1WinLose.win, days1WinLose.lose),
      },
    }
  }

  public async getTeamsConfrontation(team1Id: number, team2Id: number): Promise<object> {
    const [
      team1Matches,
      team2Matches,
      team1,
      team2,
    ] = await Promise.all([
      OpendotaService.getTeamMatches(team1Id),
      OpendotaService.getTeamMatches(team2Id),
      this.teamsService.getTeamById(team1Id),
      this.teamsService.getTeamById(team2Id),
    ])

    const lastYear = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)

    const matchesAgainst = team1Matches.filter(match => match.opposing_team_id === team2Id)
    const matchesAgainstLastYear = matchesAgainst.filter(match => new Date(match.start_time * 1000) > lastYear)

    const winTotal = matchesAgainst.filter(match => match.radiant === match.radiant_win)
    const winLastYear = matchesAgainstLastYear.filter(match => match.radiant === match.radiant_win)

    const winrateByDurationStat1 = getWinrateByMatchDuration(team1Matches)
    const winrateByDurationStat2 = getWinrateByMatchDuration(team2Matches)

    return {
      team1_id: team1.team_id,
      team1_logo: team1.logo_url,
      team1_name: team1.name,
      team2_id: team2.team_id,
      team2_logo: team2.logo_url,
      team2_name: team2.name,
      matches_against_total: matchesAgainst.length,
      matches_against_last_year: matchesAgainstLastYear.length,
      team1_winrate_against_total: getWinrate(winTotal.length, matchesAgainst.length - winTotal.length),
      team1_winrate_against_last_year: getWinrate(winLastYear.length, matchesAgainstLastYear.length - winLastYear.length),
      team1_games_longer: winrateByDurationStat1.games_longer,
      team1_games_shorter: winrateByDurationStat1.games_shorter,
      team1_winrate_longer: winrateByDurationStat1.winrate_longer,
      team1_winrate_shorter: winrateByDurationStat1.winrate_shorter,
      team2_games_longer: winrateByDurationStat2.games_longer,
      team2_games_shorter: winrateByDurationStat2.games_shorter,
      team2_winrate_longer: winrateByDurationStat2.winrate_longer,
      team2_winrate_shorter: winrateByDurationStat2.winrate_shorter,
    }
  }
}
