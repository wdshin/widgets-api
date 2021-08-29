import fetch from 'node-fetch'
import * as QueryString from 'qs'

export default class OpendotaService {
  private static API_URL : string = 'https://api.opendota.com/api'
  private static API_KEY : string = process.env.OPENDOTA_API_KEY

  public static CURRENT_PATCH : number = 49

  private static endpoints = {
    players: () => '/players',
    playersWinlose: (id, options) => `/players/${id}/wl?${QueryString.stringify(options)}`,
    playersHeroes: (id, options) => `/players/${id}/heroes?${QueryString.stringify(options)}`,
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

    return OpendotaService.get(OpendotaService.endpoints.playersWinlose(playerId, options))
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

    return OpendotaService.get(OpendotaService.endpoints.playersHeroes(playerId, options))
  }
}
