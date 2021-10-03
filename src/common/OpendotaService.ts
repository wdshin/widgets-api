import fetch from 'node-fetch'
import * as QueryString from 'qs'

export default class OpendotaService {
  private static API_URL : string = 'https://api.opendota.com/api'
  private static API_KEY : string = process.env.OPENDOTA_API_KEY

  public static CURRENT_PATCH : number = 49

  private static endpoints = {
    players: () => '/players',
    playerMatches: (id, options) => `/players/${id}/matches?${QueryString.stringify(options)}`,
    playerWinlose: (id, options) => `/players/${id}/wl?${QueryString.stringify(options)}`,
    playerTotals: (id, options) => `/players/${id}/totals?${QueryString.stringify(options)}`,
    playerHeroes: (id, options) => `/players/${id}/heroes?${QueryString.stringify(options)}`,
    teamMatches: (id) => `/teams/${id}/matches`,
    match: (id) => `/matches/${id}`
  }

  constructor() {}

  private static get = async endpoint => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OpendotaService.API_KEY}`
      },
    }

    try {
      const res = await fetch(OpendotaService.API_URL + endpoint, options).then(res => res.json())
      return res
    } catch(err) {
      return {}
    }
  }

  public static getWinLose = (playerId: number, days?, patch?) => {
    const options : any = {}

    if (days) {
      options.date = days
    }

    if (patch) {
      options.patch = patch
    }

    return OpendotaService.get(OpendotaService.endpoints.playerWinlose(playerId, options))
  }

  public static getPlayerHeroes = (playerId: number, days?, patch?) => {
    const options : any = {
      sort: true
    }

    if (days) {
      options.date = days
    }

    if (patch) {
      options.patch = patch
    }

    return OpendotaService.get(OpendotaService.endpoints.playerHeroes(playerId, options))
  }

  public static getPlayerMatches = (player_id: number, days?, patch?): Promise<Array<any>> => {
    const options : any = {
      sort: true
    }

    if (days) {
      options.date = days
    }

    if (patch) {
      options.patch = patch
    }
    
    return OpendotaService.get(OpendotaService.endpoints.playerMatches(player_id, options)) 
  }

  public static getPlayerTotals = async (playerId: number, days?, patch?): Promise<any> => {
    const options : any = {
      sort: true
    }

    if (days) {
      options.date = days
    }

    if (patch) {
      options.patch = patch
    }

    const data = await OpendotaService.get(OpendotaService.endpoints.playerTotals(playerId, options))

    const res = {}

    data.forEach(row => res[row.field] = row.sum)
    
    return res
  }

  public static getMatch = (match_id: number) => {
    return OpendotaService.get(OpendotaService.endpoints.match(match_id))
  }

  public static getTeamMatches = (teamId: number): Promise<Array<any>> => {
    return OpendotaService.get(OpendotaService.endpoints.teamMatches(teamId))
  }
}
